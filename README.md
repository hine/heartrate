# Web Bluetooth APIでChromeと心拍センサーをBLE接続するデモ

## これは何?

詳しくは後日Qiitaのエントリーとしてアップしますのでそれを御覧ください。

## 動作確認環境

- Windows10 1809
- Google Chrome バージョン: 72.0.3626.109 64bit
- Polar H7心拍センサー

## 使い方

1. ダウンロードする

    ```
    git clone https://github.com/hine/heartrate.git
    ```
    もしくは[ダウンロードリンク](https://github.com/hine/heartrate/archive/master.zip)でZIPファイルをダウンロードして展開する。

1. index.htmlをchromeで開く
1. ハートレートモニタを装着する
1. Windows/Mac上のchrome上の画面で「CONNECT」ボタンをクリックし、接続するハートレートモニタを選択すると接続されます。
1. 接続後は心拍数の値、ならびにバッテリの残量数値等が変化します。
1. 「DISCONNECT」ボタンで切断します。

## で、これどうすればいいの？！

assets/js/heartrateble.jsがハートレートモニターと接続するサンプルコードになっています。これを参考に是非色々なWebアプリケーションを作ってください！
このサンプルでは、デバイス検索のフィルタに「Polar H7」を決め打ちしています。他のデバイスを見つけたい場合は、デバイス検索フィルタを書き換えて使ってください。

## 利用しているライブラリ等

いずれもMIT Lisenceです。

- Moment.js [https://momentjs.com/](https://momentjs.com/)
- Chart.js [https://github.com/chartjs/Chart.js](https://github.com/chartjs/Chart.js)
- chartjs-plugin-streaming [https://nagix.github.io/chartjs-plugin-streaming/](https://nagix.github.io/chartjs-plugin-streaming/)