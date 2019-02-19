/*jshint esversion: 6 */
var HeartRateBLE = function() {
  // デバイス情報保持用変数
  this.ble_device = null;

  this.heartrate_value = 0;
  this.battery_level_value = 0;
};
HeartRateBLE.prototype = {
  // Class定数定義

  // heart rate モニターのUUID群
  HEART_RATE_SERVICE_UUID: '0000180d-0000-1000-8000-00805f9b34fb',
  HEART_RATE_MEASUREMENT_CHARACTERISTIC_UUID: '00002a37-0000-1000-8000-00805f9b34fb',

  BATTERY_SERVICE_UUID: '0000180f-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL_CHARACTERISTIC_UUID: '00002a19-0000-1000-8000-00805f9b34fb',

  // 接続関数（Promiseによる非同期逐次処理(.thenの部分)）
  connect: function() {
    navigator.bluetooth.requestDevice({ // デバイスの検索
      filters: [{
        namePrefix: 'Polar H7',
      }],
      // 使いたいSERVICEのUUIDを列挙する
      optionalServices: [this.HEART_RATE_SERVICE_UUID, this.BATTERY_SERVICE_UUID,]
    })
    .then(device => {
      this.ble_device = device;
      console.log("device", device);
      // GATTサーバへの接続
      return device.gatt.connect();
    })
    .then(server =>{
      console.log("server", server);
      // Promise.allは、全てを並列処理して、全てが終わったら次に進む
      return Promise.all([
        server.getPrimaryService(this.HEART_RATE_SERVICE_UUID),
        server.getPrimaryService(this.BATTERY_SERVICE_UUID),
      ]);
    })
    .then(service => {
      console.log("service", service);
      return Promise.all([
        service[0].getCharacteristic(this.HEART_RATE_MEASUREMENT_CHARACTERISTIC_UUID),
        service[1].getCharacteristic(this.BATTERY_LEVEL_CHARACTERISTIC_UUID),
      ]);
    })
    .then(characteristic => {
      console.log("HEART_RATE_MEASUREMENT:", characteristic[0]);
      // 心拍データのCharacteristicはNotificationを持っているので、更新の通知を開始、通知のコールバックを設定
      characteristic[0].startNotifications();
      characteristic[0].addEventListener('characteristicvaluechanged',this.onHeartRateValueChanged.bind(this));
      // バッテリーレベルのCharactoristicはNotificationを持っていないようだったので、一定間隔ごとに値を取得する
      this.battery_characteristic = characteristic[1];
      this.read_battery_timer = setInterval(this.readBatteryLevel.bind(this), 1000);
    })
    .catch(error => {
      alert("BLE接続に失敗しました。もう一度試してみてください");
      console.log(error);
      return;
    });
  },
  disconnect: function() {
    if (!this.ble_device || !this.ble_device.gatt.connected) return ;
    clearInterval(this.read_battery_timer);
    this.heartrate_value = 0;
    this.battery_level_value = 0;
    this.ble_device.gatt.disconnect();
    alert("BLE接続を切断しました。");
  },
  onHeartRateValueChanged: function(event) {
    var heartrate_value = 0;
    var sensor_contact_feature = false;
    var sensor_contact = false;
    var sensor_contact_text = "(機能なし)";
    var energy_expended_value = 0;
    var rr_interval_value = [];

    var position = 0;

    // フラグの確認
    var flags = event.target.value.getInt8(0);
    position++;

    // 心拍の取得
    if ((flags & 0b00000001) == 0) {
      // 心拍情報が8bitで送られてくる場合
      heartrate_value = event.target.value.getUint8(position);
      this.heartrate_value = heartrate_value;
      position++;
    } else {
      // 心拍情報が16bitで送られてくる場合
      heartrate_value = event.target.value.getUint16(position);
      position+=2;
    }
    console.log("心拍数:" + heartrate_value);

    // 接触情報の取得
    if (((flags >> 2) & 0b0000001) == 1) {
      // 接触情報を含む場合
      var sensor_contact_feature = true;
      sensor_contact_text = "非接触";
      console.log("接触センサあり");
      if (((flags >> 1) & 0b0000001) == 1) {
        var sensor_contact = true;
        sensor_contact_text = "接触";
        console.log("接触");
      }
    }

    // 消費エネルギー情報の取得
    if (((flags >> 3) & 0b0000001) == 1) {
      energy_expended_value = event.target.value.getUint16(position);
      position+=2;
      console.log("消費熱量:" + energy_expended_value);
    }

    // RRインターバル（脈間隔）情報の取得
    // 消費エネルギー情報の取得
    if (((flags >> 4) & 0b0000001) == 1) {
      for (var i=0; i < (event.target.value.byteLength - position) / 2; i++) {
        rr_interval_value.push = event.target.value.getUint16(position + i * 2);
        console.log("脈間隔:" + event.target.value.getUint16(position + i * 2));
      }
    }

    // 画面更新
    document.getElementById("heartrate-value").value = heartrate_value;
    document.getElementById("sensor-contact-text").value = sensor_contact_text;
  },
  readBatteryLevel: function () {
    //if (!this.ble_device || !this.ble_device.gatt.connected) return ;
    this.battery_characteristic.readValue()
    .then(response => {
      var battery_level = response.getUint8(0);
      this.battery_level_value = battery_level;
      // 画面更新
      document.getElementById("battery-level-value").value = battery_level;
  
      console.log("バッテリ:" + battery_level);
    });
  },
  getCurrentData() {
    return {"heartrate": this.heartrate_value, "battery": this.battery_level_value};
  }
};

window.onload = function () {
  var heartRateBLE = new HeartRateBLE();
  document.getElementById("connect-button").addEventListener("click", heartRateBLE.connect.bind(heartRateBLE), false);
  document.getElementById("disconnect-button").addEventListener("click", heartRateBLE.disconnect.bind(heartRateBLE), false);

  var ctx = document.getElementById('chart').getContext('2d');
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Heartrate(bpm)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        yAxisID: "heartbeat",
        data: []
      }, {
        label: 'Battery(%)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        fill: false,
        lineTension: 0,
        borderDash: [8, 4],  
        yAxisID: "battery",
        data: []
      }]
    },
    options: {
      scales: {
        yAxes: [{
          id: "heartbeat",   // Y軸のID
          type: "linear",   // linear固定 
          position: "left", // どちら側に表示される軸か？
          ticks: {          // スケール
              max: 250,
              min: 0,
              stepSize: 50,
          },
        }, {
          id: "battery",
          type: "linear", 
          position: "right",
          ticks: {
              max: 100,
              min: 0,
              stepSize: 20
          },
        }],
        xAxes: [{
          type: 'realtime',
          realtime: {
            onRefresh: function(chart) {
              var sensor_data = heartRateBLE.getCurrentData()
              chart.data.datasets[0].data.push({
                x: Date.now(),
                y: sensor_data["heartrate"],
              });
              chart.data.datasets[1].data.push({
                x: Date.now(),
                y: sensor_data["battery"],
              });
            },
            delay: 1000,
          },
        }]
      }
    }
  });
};
