"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnswerValue,
  ValidationResult,
  SurveyComponent,
  SurveyDocument,
} from "@/lib/survey-types";
import { answerApi } from "@/lib/api";
import type { UserProfile } from "@/lib/api/modules/user.types";

/** 需要作答的题型 */
const ANSWERABLE_TYPES = [
  // 文本输入
  "workInput",
  "workTextarea",
  "workBlanks",
  // 选择类
  "workRadio",
  "workCheckbox",
  "workSelect",
  "workImageRadio",
  "workImageCheckbox",
  // 量表评价
  "workScale",
  "workNps",
  "workEffort",
  "workSatisfaction",
  "workRating",
  // 高级题型
  "workRanking",
  "workFileUpload",
  "workCascader",
  "workDateTime",
  "workSignature",
  "workLocation",
  "workMaxDiff",
  // 矩阵类
  "workMatrixRadio",
  "workMatrixCheckbox",
  "workMatrixScale",
  "workMatrixScore",
  "workMatrixInput",
  "workDynamicTable",
];

/** 判断组件是否需要作答 */
export function isAnswerable(type: string): boolean {
  return ANSWERABLE_TYPES.includes(type);
}

/** 创建空答案 */
export function createEmptyAnswer(type: string): AnswerValue {
  switch (type) {
    case "workInput":
    case "workTextarea":
      return { type: "text", value: "" };
    case "workRadio":
    case "workSelect":
    case "workImageRadio":
      return { type: "single", value: "" };
    case "workCheckbox":
    case "workImageCheckbox":
      return { type: "multiple", value: [] };
    case "workScale":
    case "workNps":
    case "workEffort":
    case "workSatisfaction":
    case "workRating":
      // null 表示未作答；NPS 的 0 分是合法答案，不能用 0 当空值哨兵
      return { type: "scale", value: null };
    case "workRanking":
      return { type: "ranking", value: [] };
    case "workBlanks":
      return { type: "blanks", value: [] };
    case "workMatrixRadio":
    case "workMatrixCheckbox":
    case "workMatrixScale":
    case "workMatrixScore":
    case "workMatrixInput":
      return { type: "matrix", value: {} };
    case "workDynamicTable":
      return { type: "table", value: [] };
    case "workCascader":
      return { type: "cascader", value: [] };
    case "workDateTime":
      return { type: "datetime", value: "" };
    case "workFileUpload":
      return { type: "file", value: [] };
    case "workSignature":
      return { type: "signature", value: "" };
    case "workLocation":
      return { type: "location", value: "" };
    case "workMaxDiff":
      return { type: "maxdiff", value: { best: "", worst: "" } };
    default:
      return { type: "none" };
  }
}

/** 判断答案是否为空 */
export function isAnswerEmpty(answer: AnswerValue): boolean {
  switch (answer.type) {
    case "text":
      return !answer.value.trim();
    case "single":
      return !answer.value;
    case "multiple":
      return answer.value.length === 0;
    case "scale":
      return answer.value == null;
    case "ranking":
      return answer.value.length === 0;
    case "blanks":
      return answer.value.every((v) => !v.trim());
    case "matrix":
      return Object.keys(answer.value).length === 0;
    case "table":
      return answer.value.length === 0;
    case "cascader":
      return answer.value.length === 0;
    case "datetime":
      return !answer.value.trim();
    case "file":
      return answer.value.length === 0;
    case "signature":
      return !answer.value;
    case "location":
      return !answer.value.trim();
    case "maxdiff":
      return !answer.value.best && !answer.value.worst;
    default:
      return true;
  }
}

/** 从填空题题干 Quill Delta 中提取空位数量（与答题端 AnswerBlanks 逻辑一致） */
function getBlankCount(title?: string): number {
  if (!title) return 0;
  try {
    const delta = JSON.parse(title);
    return (delta.ops || []).filter(
      (op: { insert: unknown }) =>
        typeof op.insert === "object" &&
        op.insert !== null &&
        (op.insert as { type: string }).type === "blanks",
    ).length;
  } catch {
    return 0;
  }
}

/** 输入格式校验规则（对应编辑端 WorkInput/WorkTextarea 的 rule 属性） */
const FORMAT_RULES: Record<string, { pattern: RegExp; message: string }> = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: "Please enter a valid phone number",
  },
  url: {
    pattern: /^https?:\/\/[^\s]+\.[^\s]+$/i,
    message: "Please enter a valid URL",
  },
  number: {
    pattern: /^-?\d+(\.\d+)?$/,
    message: "Please enter a valid number",
  },
};

/**
 * 必答题完整性校验 + 格式校验
 * 返回错误文案；null 表示通过。
 * 比 isAnswerEmpty 更严格：部分作答（如矩阵只答一行、MaxDiff 只选一端）也算未完成。
 */
export function getAnswerError(
  comp: SurveyComponent,
  answer: AnswerValue | undefined,
): string | null {
  const props = comp.props as {
    required?: boolean;
    title?: string;
    rule?: string;
    options?: { value: string }[];
    levels?: { name: string; options: string[] }[];
    rows?: { value: string }[];
    columns?: { value: string }[];
  };
  const required = !!props.required;

  // 非必答题：仅在已作答时做格式校验
  if (!required && (!answer || isAnswerEmpty(answer))) return null;
  if (required && (!answer || isAnswerEmpty(answer))) {
    return "This field is required";
  }
  if (!answer) return null;

  // 必答题的完整性校验（部分作答不算完成）
  if (required) {
    switch (comp.type) {
      case "workBlanks": {
        if (answer.type !== "blanks") break;
        const count = getBlankCount(props.title);
        const filled = answer.value.filter((v) => v.trim()).length;
        if (filled < count) return "Please fill in all blanks";
        break;
      }
      case "workRanking": {
        if (answer.type !== "ranking") break;
        const total = (props.options || []).length;
        if (answer.value.length < total) return "Please rank all options";
        break;
      }
      case "workCascader": {
        if (answer.type !== "cascader") break;
        const total = (props.levels || []).length;
        const valid = answer.value.filter((v) => v).length;
        if (valid < total) return "Please complete all levels";
        break;
      }
      case "workMaxDiff": {
        if (answer.type !== "maxdiff") break;
        if (!answer.value.best || !answer.value.worst) {
          return "Please select both the most and least important";
        }
        break;
      }
      case "workMatrixRadio":
      case "workMatrixScale":
      case "workMatrixScore": {
        if (answer.type !== "matrix") break;
        const rows = props.rows || [];
        const done = rows.filter((r) => {
          const v = answer.value[r.value];
          return typeof v === "string" && v !== "";
        }).length;
        if (done < rows.length) return "Please answer every row";
        break;
      }
      case "workMatrixCheckbox": {
        if (answer.type !== "matrix") break;
        const rows = props.rows || [];
        const done = rows.filter((r) => {
          const v = answer.value[r.value];
          return Array.isArray(v) && v.length > 0;
        }).length;
        if (done < rows.length) return "Please answer every row";
        break;
      }
      case "workMatrixInput": {
        if (answer.type !== "matrix") break;
        const rows = props.rows || [];
        const columns = props.columns || [];
        const incomplete = rows.some((r) =>
          columns.some((c) => {
            const v = answer.value[`${r.value}__${c.value}`];
            return typeof v !== "string" || !v.trim();
          }),
        );
        if (incomplete) return "Please fill in every cell";
        break;
      }
    }
  }

  // 文本格式校验（rule 属性），非必填但已填写时同样校验
  if (
    (comp.type === "workInput" || comp.type === "workTextarea") &&
    answer.type === "text" &&
    props.rule &&
    props.rule !== "null"
  ) {
    const ruleConf = FORMAT_RULES[props.rule];
    if (ruleConf && answer.value.trim() && !ruleConf.pattern.test(answer.value.trim())) {
      return ruleConf.message;
    }
  }

  return null;
}

/** 打乱数组（Fisher-Yates），返回新数组 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 标记设备已提交某问卷
 */
export function markSurveySubmitted(surveyId: string) {
  if (typeof window === "undefined") return;
  const key = `survey_submitted_${surveyId}`;
  localStorage.setItem(key, Date.now().toString());
}

/**
 * 清除某问卷的本地暂存
 */
export function clearSurveyDraft(surveyId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`survey_draft_${surveyId}`);
}

/**
 * 保存已提交答卷内容到本地（供未登录用户回显已提交答卷）
 * 独立于 survey_submitted_${id}（去重标记）和 survey_draft_${id}（草稿）
 */
export function saveSurveyAnswered(
  surveyId: string,
  answers: Record<string, AnswerValue>,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `survey_answered_${surveyId}`,
      JSON.stringify(answers),
    );
  } catch {
    // 忽略写入错误（如存储空间不足）
  }
}

/**
 * 读取本地已提交答卷快照（未登录回显用）
 */
export function getSurveyAnswered(
  surveyId: string,
): Record<string, AnswerValue> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`survey_answered_${surveyId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, AnswerValue>;
  } catch {
    return null;
  }
}

/**
 * 答题核心 Hook
 * 管理答案、本地暂存、校验、翻页，并统一负责"回显编排"。
 *
 * 回显优先级：已提交答卷（prefill） > 本地草稿
 * - 已登录（user 非空且 authLoading 已完成）：拉取服务器 myLatest 作为 prefill
 * - 未登录：读取本地 survey_answered_${id} 快照作为 prefill
 * - 都没有（prefill 为 null）：走现有 localStorage 草稿恢复逻辑
 * prefill 应用时会清掉本地草稿（已提交为权威来源）。
 */
export interface UseSurveyAnswersOptions {
  /** 当前登录用户（来自 useAuth）。存在时优先回显服务器已提交答卷 */
  user?: UserProfile | null;
  /** 认证是否仍在加载。为 true 时暂不回显，待认证就绪后再判断，避免误用本地快照 */
  authLoading?: boolean;
}

export function useSurveyAnswers(
  survey: SurveyDocument,
  options?: UseSurveyAnswersOptions,
) {
  const { user, authLoading } = options ?? {};
  const draftKey = `survey_draft_${survey.id}`;

  // 回显来源：已登录→服务器；未登录→本地快照；null→走本地草稿
  const [serverPrefill, setServerPrefill] = useState<Record<string, AnswerValue> | null>(null);

  // 是否需要打乱题目顺序（仅对可作答题目打乱，保持页码分组）
  const shuffledComponentList = useMemo(() => {
    if (!survey.settings.shuffleQuestions) return survey.componentList;
    // 按页分组后，对每页内的题目打乱
    const byPage = new Map<number, SurveyComponent[]>();
    for (const comp of survey.componentList) {
      const list = byPage.get(comp.page) ?? [];
      list.push(comp);
      byPage.set(comp.page, list);
    }
    const result: SurveyComponent[] = [];
    const pages = [...byPage.keys()].sort((a, b) => a - b);
    for (const page of pages) {
      result.push(...shuffle(byPage.get(page)!));
    }
    return result;
  }, [survey.componentList, survey.settings.shuffleQuestions]);

  // 初始化空答案（SSR 和客户端一致）
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => {
    const initial: Record<string, AnswerValue> = {};
    for (const comp of survey.componentList) {
      if (isAnswerable(comp.type)) {
        initial[comp.feUuid] = createEmptyAnswer(comp.type);
      }
    }
    return initial;
  });

  // 客户端挂载后从 localStorage 恢复暂存
  // 仅依赖 draftKey（由 survey.id 派生，稳定），避免 componentList 引用变化触发循环
  const componentListRef = useRef(survey.componentList);
  useEffect(() => {
    componentListRef.current = survey.componentList;
  }, [survey.componentList]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft: Record<string, AnswerValue> = JSON.parse(raw);
       
      setAnswers((prev) => {
        const next = { ...prev };
        let hasChange = false;
        for (const comp of componentListRef.current) {
          if (isAnswerable(comp.type) && draft[comp.feUuid]) {
            next[comp.feUuid] = draft[comp.feUuid];
            hasChange = true;
          }
        }
        // 无变化时返回原引用，避免触发不必要的重渲染
        return hasChange ? next : prev;
      });
    } catch {
      // 忽略解析错误
    }
     
  }, [draftKey]);

  // 回显编排：已登录→服务器 myLatest；未登录→本地已提交快照；认证就绪前不回显
  useEffect(() => {
    if (authLoading) return;
    const surveyId = Number(survey.id);
    if (!surveyId) return;

    if (user) {
      // 已登录：拉取服务器已提交答卷
      let cancelled = false;
      answerApi
        .myLatest(surveyId)
        .then((res) => {
          if (cancelled || !res) return;
          setServerPrefill(res.content as Record<string, AnswerValue>);
        })
        .catch(() => {
          // 静默失败：保持 null，降级到本地草稿
        });
      return () => {
        cancelled = true;
      };
    }

    // 未登录：本地已提交答卷快照（无则为 null，走本地草稿）
    setServerPrefill(getSurveyAnswered(survey.id));
  }, [survey.id, user, authLoading]);

  // 已提交答卷回显（优先级高于本地草稿）
  // serverPrefill：已登录→服务器 myLatest；未登录→本地 survey_answered 快照；null→无
  useEffect(() => {
    if (!serverPrefill) return;
    setAnswers((prev) => {
      const next = { ...prev };
      let hasChange = false;
      for (const comp of componentListRef.current) {
        if (!isAnswerable(comp.type)) continue;
        const v = serverPrefill[comp.feUuid];
        // 仅回显结构合法的答案（含 type 字段），避免脏数据
        if (v && typeof (v as { type?: unknown }).type === "string") {
          next[comp.feUuid] = v;
          hasChange = true;
        }
      }
      return hasChange ? next : prev;
    });
    // 已提交为权威来源，清掉本地草稿避免脏草稿回盖
    clearSurveyDraft(survey.id);
  }, [serverPrefill, survey.id]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 暂存到 localStorage（防抖）
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(answers));
      } catch {
        // 忽略写入错误（如存储空间不足）
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, draftKey]);

  const updateAnswer = useCallback((feUuid: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [feUuid]: value }));
    setErrors((prev) => {
      if (!prev[feUuid]) return prev;
      const next = { ...prev };
      delete next[feUuid];
      return next;
    });
  }, []);

  /** 校验指定页码的所有必答题 */
  const validatePage = useCallback(
    (page: number, componentList: SurveyComponent[]): ValidationResult => {
      const pageComponents = componentList.filter(
        (c) => c.page === page && !c.isHidden && isAnswerable(c.type),
      );
      const newErrors: Record<string, string> = {};
      for (const comp of pageComponents) {
        const error = getAnswerError(comp, answers[comp.feUuid]);
        if (error) {
          newErrors[comp.feUuid] = error;
        }
      }
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return {
        valid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      };
    },
    [answers],
  );

  /** 校验全部问卷 */
  const validateAll = useCallback(
    (componentList: SurveyComponent[]): ValidationResult => {
      const allErrors: Record<string, string> = {};
      for (const comp of componentList) {
        if (!isAnswerable(comp.type) || comp.isHidden) continue;
        const error = getAnswerError(comp, answers[comp.feUuid]);
        if (error) {
          allErrors[comp.feUuid] = error;
        }
      }
      setErrors(allErrors);
      return {
        valid: Object.keys(allErrors).length === 0,
        errors: allErrors,
      };
    },
    [answers],
  );

  return {
    answers,
    errors,
    updateAnswer,
    validatePage,
    validateAll,
    /** 打乱后的组件列表（若启用） */
    shuffledComponentList,
  };
}