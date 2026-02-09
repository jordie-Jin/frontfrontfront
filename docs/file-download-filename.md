# 파일 다운로드 한글 파일명 처리 가이드

## 요약
한글 파일명이 깨지는 문제는 서버의 `Content-Disposition` 헤더에 UTF-8 파일명을 올바르게 설정하면 해결됩니다.  
브라우저는 `filename*` 값을 우선 사용하며, `filename`은 ASCII 폴백 용도로 둡니다.

## 권장 헤더 형식
```
Content-Disposition: attachment; filename="report.pdf"; filename*=UTF-8''%ED%95%9C%EA%B8%80.pdf
```

## 예시 (파일명: CJ_분석리포트.pdf)
```
Content-Disposition: attachment; filename="CJ_report.pdf"; filename*=UTF-8''CJ_%EB%B6%84%EC%84%9D%EB%A6%AC%ED%8F%AC%ED%8A%B8.pdf
```

## Spring(Java) 예시
```java
String filename = "CJ_분석리포트.pdf";
String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8)
                           .replaceAll("\\+", "%20");

response.setHeader("Content-Disposition",
  "attachment; filename=\"report.pdf\"; filename*=UTF-8''" + encoded);
```

## 프론트와의 관계
프론트가 `a.download` 값을 직접 지정하면 브라우저가 그 값을 우선 사용합니다.  
서버의 `Content-Disposition` 파일명을 그대로 쓰려면 `a.download`를 비우거나  
다운로드 URL을 직접 열어 브라우저 기본 다운로드 동작을 이용하는 방식이 권장됩니다.
