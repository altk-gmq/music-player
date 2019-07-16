$(function(){
    $(".music_list").mCustomScrollbar();
    let app = new Vue({
        el:"#app",
        data:{
            musicData:[],
            link_url:"./source/告白气球.mp3",
            currIndex:0,
            isStop:true,
            autoplay:false,
            totalTime:"00:00:00",
            currentTime:"00:00:00",
            pressWidht:0,
            singer_pic:"./source/告白气球.jpg",
            sing_name:"告白气球",
            singer_name:"周杰伦",
            sing_album:"周杰伦的床边故事",
            playMode:"sjplay",
            playModeCurr:0,
            lyricsPath:"",
            lyrics:[],
            lyricsTime:[],
            lyricsIndex:-1,
        },
        methods:{
            //获取音乐列表渲染
            getMusic(){
                let self = this;
                $.ajax({
                    type:"get",
                    dataType:"json",
                    url:"./source/musiclist.json",
                    success:function(res){
                        self.musicData = res;
                    }
                })
            },
              // 自定义播放
            auto(){
                let playMode = ["sjplay","oneplay","listplay"];
                this.playModeCurr ++;
                if(this.playModeCurr>playMode.length-1){
                    this.playModeCurr = 0;
                }
                this.playMode = playMode[this.playModeCurr];
            },
            //切换音乐
            playToggle(){
                if(this.currIndex == -1) return;
                let audio = this.$refs.audio;
                if(audio.paused){
                    audio.play();
                    this.isStop = false;
                    // this.musicPlay(audio);
                    this.changeMusicPlay(this.currIndex);
                }else{
                    audio.pause();
                    this.isStop = true;
                }
                
            },
            // 下一首
            nextplay(){
                this.isStop = false;
                if(this.playMode == "listplay" || this.playMode == "oneplay"){
                    this.currIndex ++;
                    if(this.currIndex>this.musicData.length-1){
                        this.currIndex = 0;
                    }
                    this.changeMusicPlay(this.currIndex);
                    this.musicPlay(this.$refs.audio);
                }else if(this.playMode == "sjplay"){
                    this.currIndex = Math.floor(Math.random()*this.musicData.length);
                    this.changeMusicPlay(this.currIndex);
                    this.musicPlay(this.$refs.audio);
                }
            },
            // 上一首
            prevplay(){
                this.isStop = false;
                this.musicPlay(this.$refs.audio);
                if(this.playMode == "listplay" || this.playMode == "oneplay"){
                    this.currIndex --;
                    if(this.currIndex<0){
                        this.currIndex = this.musicData.length-1;
                    }
                    this.changeMusicPlay(this.currIndex);
                    this.musicPlay(this.$refs.audio);
                }else if(this.playMode == "sjplay"){
                    this.currIndex = Math.floor(Math.random()*this.musicData.length);
                    this.changeMusicPlay(this.currIndex);
                    this.musicPlay(this.$refs.audio);
                }
            },
            // 鼠标点击改变音乐
             changeMusic(i){
                this.isStop = false;
                this.currIndex = i;
                this.lyricsIndex = -1;
                this.$refs.songLyrics.style.marginTop = 0;
                this.changeMusicPlay(this.currIndex);
                this.musicPlay(this.$refs.audio);
            },
            //改变播放音乐，背景
            changeMusicPlay(curr){
                this.link_url = this.musicData[curr].link_url;
                this.singer_pic = this.musicData[curr].cover;
                this.sing_name = this.musicData[curr].name;
                this.singer_name = this.musicData[curr].singer;
                this.sing_album = this.musicData[curr].album;
                this.lyricsPath = this.musicData[curr].link_lrc;
                this.$refs.mask_bg.style.background = "url("+this.musicData[curr].cover+") no-repeat 0 0";
                this.$refs.mask_bg.style.backgroundSize = "cover";
                this.totalTime = this.musicData[curr].time;
                this.musicPlay(this.$refs.audio);
                    //获取歌词信息
                    let self = this;
                    if(this.lyricsPath == ""){
                        this.lyrics = ['没有该歌曲歌词信息！']
                        return
                    };
                    $.ajax({
                        type:"get",
                        dataType:"text",
                        url:""+this.lyricsPath+"",
                        success:function(res){
                            self.lyrics = [];
                            self.lyricsTime = [];
                            self.loadLyrics(res);
                        }
                    })
            },
            // 解析歌词
            loadLyrics(data){
                let array = data.split('\n');
                // 正则表达式解析歌词
                let timeReg = /\[(\d*:\d*\.\d*)\]/;
                // console.log(array)
                // 遍历歌词
                let self = this;
                $.each(array,function(index,ele){
                    // console.log(ele);
                    //处理歌词
                    let lyricsList = ele.split("]")[1];
                    if(lyricsList.length <= 1) return true;
                    //歌词存到data中
                    self.lyrics.push(lyricsList);
                    let res = timeReg.exec(ele);
                    if(res == null) return true;
                    let timeStr = res[1];
                    let res2 = timeStr.split(":");
                    let min = parseInt(res2[0]*60);
                    let sec = parseFloat(res2[1]);
                    let time = parseFloat(Number(min+sec).toFixed(2));
                    //把时间存到data中
                    self.lyricsTime.push(time);                  
                });
                // console.log(this.lyrics);
            },
            // 音乐播放触发方法
            musicPlay(val){
                let self = this;
                val.addEventListener("timeupdate",function(){
                    self.pressWidht = val.currentTime/this.duration*100;
                    self.currentTime = self.getTime(val.currentTime);
                    // console.log(val.currentTime);
                    if(val.currentTime > self.lyricsTime[0] && self.lyricsPath != ""){
                        self.lyricsIndex ++ ;
                        self.lyricsTime.shift();
                        if(self.lyricsIndex <= 2) return;
                        self.$refs.songLyrics.style.marginTop = (-self.lyricsIndex+2)*30 + 'px';
                    }
                });
                this.autoplay = true;
                val.play();
            },
             // 播放完成
            ended(){
                if(this.playMode == "oneplay"){
                    // this.changeMusicPlay(this.currIndex);
                    this.isStop = false;
                    this.$refs.audio.currentTime = 0;
                    this.musicPlay(this.$refs.audio);
                }else if(this.playMode == "listplay"){
                    this.isStop = false;
                    this.$refs.audio.currentTime = 0;
                    this.currIndex ++;
                    if(this.currIndex>this.musicData.length-1){
                        this.currIndex = 0;
                    }
                    this.changeMusicPlay(this.currIndex);
                    this.musicPlay(this.$refs.audio);
                }else if(this.playMode == "sjplay"){
                    this.currIndex = Math.floor(Math.random()*this.musicData.length);
                    this.changeMusicPlay(this.currIndex);
                    this.musicPlay(this.$refs.audio);
                }
                this.lyricsIndex = -1;
            },
            //转换音乐时间
            getTime(time){
                let hour = Math.floor(time/3600);
                hour = hour<10?"0"+hour:hour;
                let min = Math.floor(time%3600/60);
                min = min<10?"0"+min:min;
                let sec = Math.floor(time%60);
                sec = sec<10?"0"+sec:sec;
                return hour+":"+min+":"+sec;
            },
            // 点击实现跳转播放
            progressClick(event){
                // 距离窗口off
                if(this.totalTime == "00:00:00") return;
                let progressLeft = this.$refs.progress.offsetLeft;
                //鼠标当前位置
                let currentPosition = event.clientX;
                //当前进度
                let percent = (currentPosition - progressLeft)/this.$refs.progress.offsetWidth;
                // console.log(this.pressWidht);
                this.pressWidht = percent*this.$refs.audio.duration;
                this.$refs.audio.currentTime = this.pressWidht;
            },
            // 列表高度自动
            autoHeight(){
                let screenHeight = document.documentElement.clientHeight || document.body.clientHeight;
                this.$refs.musicBox.style.height = screenHeight -175 + 'px';
            },
        },
        mounted() {
            //加载音乐列表
            this.getMusic();   
            this.autoHeight();
            let self = this;
            window.onresize = function(){
                self.autoHeight();
            }
        },
    })
})
