# 웰스토리 메뉴 PDF Parser

[
  ![npm](https://img.shields.io/npm/v/welstory-menu-pdf-parser)
  ![NPM](https://img.shields.io/npm/l/welstory-menu-pdf-parser)
](https://www.npmjs.com/package/welstory-menu-pdf-parser)

삼성 웰스토리 구내식당 영양사님께서 매주 메일로 보내주시는 메뉴 PDF 파일에서 메뉴 정보를 식사, 날짜별로 구분하여 구글 캘린더 등에 등록하여 사용하기 위한 목적으로 만들어진 모듈 입니다.

현재 [와디즈](https://www.wadiz.kr)가 입주되어 있는 판교디지털센터(PDC) 구내식당의 매뉴를 [잔디(JANDI)](https://www.jandi.com/)의 Webhook을 활용하여 알림을 발송하는데 사용되고 있습니다.

> [잔디 메신저 활용 이야기 - 와디즈 캐스트](https://www.wadiz.kr/web/wcast/detail/5352)

그리고 `welstory-menu-pdf-parser`는 [`pdf2json`](https://www.npmjs.com/package/pdf2json) 패키지의 의존성을 가지고 있습니다.

## 설치

```bash
# Yarn
yarn add welstory-menu-pdf-parser

# npm
npm install welstory-menu-pdf-parser
```

## 예제

```js
const fs = require('fs');
const { menuPdfParser } = require('welstory-menu-pdf-parser');

const file = fs.readFileSync('/path/to/menu.pdf');
menuPdfParser(file)
  .then(data => console.log(data));
```

`WelstoryMenuParser` 인스턴스를 직접 사용하는 방법

```js
const fs = require('fs');
const PDFParser = require('pdf2json');
const { WelstoryMenuParser } = require('welstory-menu-pdf-parser');

const pdf2Json = new PDFParser();
pdf2Json.on('pdfParser_dataReady', (data) => {
  const parser = new WelstoryMenuParser(data);

  // 기본 데이터 세트
  console.log(parser.getData());

  // 식사별로 구분되어 있는 데이터 (구글 캘린더에 등록하기 위한 용도)
  // `menuPdfParser` 함수를 사용할 때에 기본적으로 `getMeals` 함수로 호출됩니다.
  console.log(parser.getMeals());
});
pdf2Json.on('pdfParser_dataError', (error) => {
  console.error(error.parserError);
});

const file = fs.readFileSync('/path/to/menu.pdf');
pdf2Json.parseBuffer(file);
```

