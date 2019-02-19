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
    もしくは[]ダウンロードリンク](https://github.com/hine/heartrate/archive/master.zip)でZIPファイルをダウンロードして展開する。

1. index.htmlをchromeで開く
1. ハートレートモニタを装着する
1. Windows/Mac上のchrome上の画面で「CONNECT」ボタンをクリックし、接続するハートレートモニタを選択すると接続されます。
1. 接続後は心拍数の値、ならびにバッテリの残量数値等が変化します。
1. 「DISCONNECT」ボタンで切断します。

## で、これどうすればいいの？！

assets/js/heartrateble.jsがmicro:bitと接続するサンプルコードになっています。これを参考に是非色々なWebアプリケーションを作ってください！
