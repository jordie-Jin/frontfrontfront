// 법률 문서 표시 시 마크다운 헤더 기호(#)를 제거합니다.
export const normalizeLegalMarkdown = (content: string): string =>
  content
    .split('\n')
    .map((line) => line.replace(/^\s{0,3}#{1,6}\s+/, ''))
    .join('\n')
    .trim();

