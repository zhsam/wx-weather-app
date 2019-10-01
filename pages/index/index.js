const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const UNPROMTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

Page({
  data: {
    nowTemp: "12",
    nowWeather: "多云",
    nowWeatherBackground: "",
    hourlyWeather: [],
    todayTemp: "",
    todayDate: "",
    city: "广州市",
    locationAuthType: UNPROMTED
  },
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad(){
    this.qqmapsdk = new QQMapWX({
      // key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
      key: '64HBZ-NMRL5-IMVIX-QARWU-NJUHJ-MJB7H'
    })

    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED:(auth===false) ? UNAUTHORIZED : UNPROMTED,
        })
        if(auth)
          this.getCityAndWeather()
        else
          this.getNow()

      }
    })
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:res => {
        let result = res.data.result
        // console.log(result)
        this.setNow(result) // 设置当前天气
        this.setHourlyWeather(result) // 设置未来几个小时的天气
        this.setToday(result)
      },
      complete: ()=>{
        callback && callback()
      }
    })
  },
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp + 'º',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setHourlyWeather(result){
    let forecast = result.forecast
    let nowHours = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHours) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + 'º'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}º - ${result.today.maxTemp}º`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTapLocation(){
    if (this.data.locationAuthType === UNAUTHORIZED)
    {
      wx.openSetting({
        success: res=>{
          let auth = res.authSetting["scope.userLocation"]
          if (auth){
            this.getCityAndWeather()
          }
        }
      })
    }
    else
      this.getCityAndWeather()
  },
  getCityAndWeather(){
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: response => {
            let city = response.result.address_component.city
            console.log(city)
            this.setData({
              city: city,
            })
            this.getNow()
          }
        });

      },
      fail: ()=>{
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }
})
