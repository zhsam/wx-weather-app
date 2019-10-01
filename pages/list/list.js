const dayMap = [
'星期日',
'星期一',
'星期二',
'星期三',
'星期四',
'星期五',
'星期六'
]

Page({
  data: {
    weekWeather: [],
    city: "广州市"
  },
  onLoad(options){
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },
  onPullDownRefresh(){
    this.getWeekWeather(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: '台北'
      },
      success: res => {
        let result = res.data.result
        this.setWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })

  },
  setWeekWeather(result){
    let weekWeather = []
    for (let i = 0; i < 7; i++){
      let date = new Date()
      date.setDate(date.getDay()+i)
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() +1}-${date.getDate()}`,
        temp: `${result[i].minTemp}º ~ ${result[i].maxTemp}º`,
        iconPath: '/images/' + result[i].weather + '-icon.png'
      })
    }
    weekWeather[0].day = '今天'
    this.setData({
      weekWeather
    })
  }

})