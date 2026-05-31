const WEB_TEST_TYPE_PREFIX = "__WEB_TEST_TYPE__:";
const WEB_TEST_TIME_ASSESSMENT_PREFIX = "__WEB_TEST_TIME_ASSESSMENT__:";

export type WebTestType = "SPI" | "TG_WEB" | "GAB" | "CAB" | "SCOA" | "EF_1G" | "CUBIC" | "OTHER";

export type WebTestTimeAssessment = "ENOUGH" | "JUST_RIGHT" | "NOT_ENOUGH";

export const webTestTypeOptions: Array<{ value: WebTestType; label: string }> = [
  { value: "SPI", label: "SPI" },
  { value: "TG_WEB", label: "TG-WEB" },
  { value: "GAB", label: "GAB" },
  { value: "CAB", label: "CAB" },
  { value: "SCOA", label: "SCOA" },
  { value: "EF_1G", label: "eF-1G" },
  { value: "CUBIC", label: "CUBIC" },
  { value: "OTHER", label: "その他" },
];

export const webTestTimeAssessmentOptions: Array<{
  value: WebTestTimeAssessment;
  label: string;
}> = [
  { value: "ENOUGH", label: "余裕があった" },
  { value: "JUST_RIGHT", label: "ちょうどよかった" },
  { value: "NOT_ENOUGH", label: "足りなかった" },
];

function readPrefixedValue(source: string | null | undefined, prefix: string) {
  if (!source?.startsWith(prefix)) {
    return "";
  }

  return source.slice(prefix.length);
}

export function encodeWebTestType(value: string) {
  return value ? `${WEB_TEST_TYPE_PREFIX}${value}` : undefined;
}

export function decodeWebTestType(source: string | null | undefined) {
  return readPrefixedValue(source, WEB_TEST_TYPE_PREFIX) as WebTestType | "";
}

export function encodeWebTestTimeAssessment(value: string) {
  return value ? `${WEB_TEST_TIME_ASSESSMENT_PREFIX}${value}` : undefined;
}

export function decodeWebTestTimeAssessment(source: string | null | undefined) {
  return readPrefixedValue(source, WEB_TEST_TIME_ASSESSMENT_PREFIX) as WebTestTimeAssessment | "";
}

export function isEncodedWebTestMeta(source: string | null | undefined) {
  return (
    Boolean(source?.startsWith(WEB_TEST_TYPE_PREFIX)) ||
    Boolean(source?.startsWith(WEB_TEST_TIME_ASSESSMENT_PREFIX))
  );
}

export function getWebTestTypeLabel(value: string | null | undefined) {
  return webTestTypeOptions.find((option) => option.value === value)?.label ?? null;
}

export function getWebTestTimeAssessmentLabel(value: string | null | undefined) {
  return webTestTimeAssessmentOptions.find((option) => option.value === value)?.label ?? null;
}
