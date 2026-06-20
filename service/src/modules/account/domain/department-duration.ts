import type { Department } from "../../../common/domain/department";

const FOUR_YEAR_DEPARTMENTS: ReadonlySet<Department> = new Set(["IT_EXPERT", "GAME_RESEARCH"]);

const THREE_YEAR_DEPARTMENTS: ReadonlySet<Department> = new Set(["IT_SPECIALIST", "GAME_ENGINEER"]);

const ONE_YEAR_DEPARTMENTS: ReadonlySet<Department> = new Set(["ADVANCED_STUDIES"]);

/**
 * 学科から修業年数を導出する。
 *
 * - 4年制: ITエキスパート, ゲーム開発研究
 * - 3年制: ITスペシャリスト, ゲームエンジニア
 * - 1年制: 総合研究科
 * - 2年制: 上記以外すべて
 */
export function getDurationYears(department: Department): 1 | 2 | 3 | 4 {
  if (FOUR_YEAR_DEPARTMENTS.has(department)) return 4;
  if (THREE_YEAR_DEPARTMENTS.has(department)) return 3;
  if (ONE_YEAR_DEPARTMENTS.has(department)) return 1;
  return 2;
}
