/**
 * English dictionary
 */
export const en = {
  nav: {
    home: "Home",
    workspace: "Workspace",
    resources: "Resources",
    docs: "Docs",
    about: "About",
    contact: "Contact",
    notFound: "404",
    signIn: "Sign in",
    signUp: "Sign up",
    menu: "Menu",
    profile: "Profile",
    signOut: "Sign out",
  },

  auth: {
    signinTitle: "Welcome back. We exist to make entrepreneurism easier.",
    signupTitle: "Welcome. We exist to make entrepreneurism easier.",
    email: "Email", password: "Password", name: "Name",
    troubleSigningIn: "Having trouble signing in?", keepSignedIn: "Keep me signed in",
    signIn: "Sign in", signUp: "Sign up", or: "Or",
    noAccount: "Don't you have an account?", haveAccount: "Already using Simple?",
    resetTitle: "Let's get you back up on your feet", resetButton: "Send reset link",
  },
  notFound: { title: "Oh, No! You stumbled upon a rarity", button: "Go back home" },
  footer: {
    resources: "Resources", company: "Company", legal: "Legal", subscribe: "Subscribe",
    subscribeBlurb: "The latest product updates and tips, sent to your inbox monthly.",
    documentation: "Documentation", blog: "Blog",
    contact: "Contact", about: "About",
    terms: "Terms", privacy: "Privacy Policy",
    copyright: "© Cruip.com. All rights reserved.",
  },
  subscribe: {
    signInToSubscribe: "Sign in to subscribe",
    emailLabel: "Email",
    submitAria: "Subscribe",
    submitting: "Subscribing…",
    subscribedHint: "Subscribed",
    error: "Subscription failed, please try again",
    networkError: "Network error, please try again later",
  },

  // ─── Editor ─────────────────────────────────────
  editor: {
    // 题型分组
    groupTextDisplay: "Text Display",
    groupUserInput: "User Input",
    groupUserChoice: "User Choice",
    groupScale: "Scale & Rating",
    groupAdvanced: "Advanced",
    groupMatrix: "Matrix",

    // EditHeader
    untitled: "Untitled",
    saving: "Saving...",
    saved: "Saved",
    saveFailed: "Save failed",
    draftSaved: "Draft saved",
    draftSaveFailed: "Draft save failed",
    editTitle: "Edit title",
    changeSurveyTitle: "Change survey title",
    cancel: "Cancel",
    confirm: "Confirm",
    history: "History",
    saveDraft: "Save draft",
    publish: "Publish",
    untitledSurvey: "Untitled Survey",

    // EditToolbar toasts / tooltips
    deleted: "Deleted «{title}»",
    shown: "«{title}» shown",
    hidden: "«{title}» hidden",
    unlocked: "«{title}» unlocked",
    locked: "«{title}» locked",
    copied: "Copied",
    pasted: "Pasted",
    movedUp: "Moved up",
    movedDown: "Moved down",
    undone: "Undone",
    redone: "Redone",
    renamed: "Renamed",
    delete: "Delete",
    hide: "Hide",
    show: "Show",
    lock: "Lock",
    unlock: "Unlock",
    copy: "Copy",
    paste: "Paste",
    moveUp: "Move up",
    moveDown: "Move down",
    undo: "Undo",
    redo: "Redo",
    deleteTooltip: "Delete (Del)",
    hideTooltip: "Hide",
    showTooltip: "Show",
    lockTooltip: "Lock",
    unlockTooltip: "Unlock",
    copyTooltip: "Copy (Ctrl+C)",
    pasteTooltip: "Paste (Ctrl+V)",
    moveUpTooltip: "Move up",
    moveDownTooltip: "Move down",
    undoTooltip: "Undo (Ctrl+Z)",
    redoTooltip: "Redo (Ctrl+Shift+Z)",

    // PublishDialog
    publishSurvey: "Publish Survey",
    answerPermission: "Answer Permission",
    noLoginRequired: "No login required",
    noLoginRequiredDesc: "Anyone can answer via the link",
    loginRequired: "Login required",
    loginRequiredDesc: "Login is required to answer",
    collectionRules: "Collection Rules",
    deadline: "Deadline",
    selectDate: "Select date",
    maxResponses: "Max responses",
    maxResponsesPlaceholder: "0 = unlimited",
    showProgressBar: "Show progress bar",
    showPublicResults: "Allow respondents to view results",
    publishTipNoLogin: "No-login mode is on. Anyone can answer via the link. You can stop collection in the workspace at any time.",
    publishTipLogin: "Login-required mode is on. Respondents must log in to answer. You can stop collection in the workspace at any time.",
    confirmPublish: "Confirm Publish",
    publishSuccess: "Published successfully!",
    publishFailed: "Publish failed. Please try again.",
    surveyPublished: "Published",
    shareLink: "Share link",
    preview: "Preview",
    openSharePage: "Open share page",
    viewStats: "View statistics",
    copiedToClipboard: "Link copied to clipboard",
    done: "Done",

    // HistoryDialog
    historyTitle: "History",
    loadHistoryFailed: "Failed to load history",
    loadPreviewFailed: "Failed to load preview",
    noHistory: "No history yet",
    auto: "Auto",
    manual: "Manual",
    previewVersion: "Preview v{version}",
    rollbackToVersion: "Roll back to this version",
    rollbackSuccess: "Rolled back to selected version",
    rollbackFailed: "Rollback failed",
    clickLeftToPreview: "Click a version on the left to preview",
    unnamed: "Unnamed",
    noQuestionData: "No question data",
    close: "Close",

    // Layers
    page: "Page {page}",
    renameComponent: "Rename component",
    deleteMenuItem: "Delete",
    moveForwardMenuItem: "Move forward",
    moveBackMenuItem: "Move back",
    copyMenuItem: "Copy",
    addMenuItem: "Add",
    addedComponent: "Added component: {title}",
    menuActionToast: "«{action}» done",
    maxComponentsPerPageReached: "Up to {max} components per page, limit reached",
    maxPagesReached: "Up to {max} pages, limit reached",
    loading: "Loading...",
    surveyEnd: "Survey End",
    thankYou: "Thank you for participating!",
    noComponents: "No components yet",
    addComponentHint: "Click a component from the left panel to add it",

    // Component type titles (for ComponentLib display)
    ctWorkInfo: "Survey Title",
    ctWorkTitle: "Subtitle",
    ctWorkParagraph: "Paragraph",
    ctWorkInput: "Single-line Input",
    ctWorkTextarea: "Multi-line Input",
    ctWorkBlanks: "Multiple Blanks",
    ctWorkRadio: "Single Choice",
    ctWorkCheckbox: "Multiple Choice",
    ctWorkSelect: "Dropdown",
    ctWorkImageRadio: "Image Single Choice",
    ctWorkImageCheckbox: "Image Multiple Choice",
    ctWorkScale: "Scale",
    ctWorkNps: "NPS",
    ctWorkEffort: "Effort",
    ctWorkSatisfaction: "Satisfaction",
    ctWorkRating: "Rating",
    ctWorkRanking: "Ranking",
    ctWorkFileUpload: "Image/File",
    ctWorkCascader: "Cascader",
    ctWorkDateTime: "Date/Time",
    ctWorkSignature: "Signature",
    ctWorkLocation: "Location",
    ctWorkMaxDiff: "MaxDiff",
    ctWorkMatrixRadio: "Matrix Radio",
    ctWorkMatrixCheckbox: "Matrix Checkbox",
    ctWorkMatrixScale: "Matrix Scale",
    ctWorkMatrixScore: "Matrix Score",
    ctWorkMatrixInput: "Matrix Input",
    ctWorkDynamicTable: "Dynamic Table",

    // Component type describes
    cdWorkInfo: "Main title and description of the survey",
    cdWorkTitle: "Subtitle component",
    cdWorkParagraph: "Paragraph text",
    cdWorkInput: "Single-line input box",
    cdWorkTextarea: "Multi-line input box",
    cdWorkBlanks: "Multiple blanks component",
    cdWorkRadio: "Single choice component",
    cdWorkCheckbox: "Multiple choice component",
    cdWorkSelect: "Dropdown component",
    cdWorkImageRadio: "Image single choice component",
    cdWorkImageCheckbox: "Image multiple choice component",
    cdWorkScale: "Scale question component",
    cdWorkNps: "NPS net promoter score component",
    cdWorkEffort: "Effort evaluation component",
    cdWorkSatisfaction: "Satisfaction evaluation component",
    cdWorkRating: "Rating component",
    cdWorkRanking: "Ranking question component",
    cdWorkFileUpload: "File upload component",
    cdWorkCascader: "Cascader selection component",
    cdWorkDateTime: "Date and time picker component",
    cdWorkSignature: "Handwriting signature component",
    cdWorkLocation: "Geolocation component",
    cdWorkMaxDiff: "MaxDiff component",
    cdWorkMatrixRadio: "Matrix radio component",
    cdWorkMatrixCheckbox: "Matrix checkbox component",
    cdWorkMatrixScale: "Matrix scale component",
    cdWorkMatrixScore: "Matrix score component",
    cdWorkMatrixInput: "Matrix input component",
    cdWorkDynamicTable: "Dynamic table component",

    // PropComponent labels
    propRequired: "Required",
    propPlaceholder: "Placeholder text",
    propTextFormat: "Text format",
    propFormatNone: "Any",
    propFormatEmail: "Email",
    propFormatPhone: "Phone",
    propFormatUrl: "URL",
    propFormatNumber: "Number",
    propLevels: "Number of levels",
    propLevelOption: "{n} levels",
    propDisplayStyle: "Display style",
    propStyleEmoji: "Emoji",
    propStyleText: "Text",
    propPerRow: "Per row",
    propColumn1: "1 column",
    propColumn2: "2 columns",
    propColumn3: "3 columns",
    propColumn4: "4 columns",
    propNoProps: "No properties",
    propNoPropsInfoDesc: "Current info has no properties to configure",
    propNoPropsParagraphDesc: "Current paragraph has no properties to configure",
    propNoPropsTitleDesc: "Current title has no properties to configure",
    propCanvasWidth: "Canvas width",
    propCanvasHeight: "Canvas height",
    propMaxScore: "Max score",
    propScoreOption: "{n} points",
    propIconType: "Icon type",
    propIconStar: "Star",
    propIconHeart: "Heart",
    propIconEmoji: "Emoji",
    propIconNumber: "Number",
    propType: "Type",
    propDateType: "Date",
    propTimeType: "Time",
    propDatetimeType: "Date & Time",
    propMinValue: "Min value",
    propMaxValue: "Max value",
    propMinLabel: "Left label",
    propMaxLabel: "Right label",
    propMinRows: "Min rows",
    propMaxFiles: "Max files",
    propAcceptType: "Allowed types",
    propAcceptImage: "Images only",
    propAcceptFile: "All files",
    propMaxSize: "Max size (MB)",

    // Canvas (Component.tsx) text
    canvasOption: "Option",
    canvasAddOption: "Add option",
    canvasAddQuestion: "Add question",
    canvasAddColumn: "Add column",
    canvasAddLevel: "Add level",
    canvasQuestionN: "Question {n}",
    canvasColumnN: "Column {n}",
    canvasOptionN: "Option {n}",
    canvasCascaderLevelN: "Level {n}",
    canvasPleaseSelect: "Please select",
    canvasPleaseInput: "Please enter",
    canvasExtremelyUnlikely: "Extremely unlikely",
    canvasExtremelyLikely: "Extremely likely",
    canvasVeryDifficult: "Very difficult",
    canvasVeryEasy: "Very easy",
    canvasSignatureArea: "Signature area",
    canvasMostImportant: "Most important",
    canvasLeastImportant: "Least important",
    canvasScore: "Score",
    canvasScoring: "Scoring",
    canvasGetLocation: "Click to get current location",
    canvasUploadHint: "Click or drag files here to upload",
    canvasUploadImageHint: "Supports image upload, up to {maxFiles} files, each no larger than {maxSize}MB",
    canvasUploadFileHint: "Supports file upload, up to {maxFiles} files, each no larger than {maxSize}MB",
    canvasUploadImage: "Upload image",
    canvasReplaceImage: "Replace image",
    canvasUploading: "Uploading...",
    canvasUploadFailed: "Image upload failed, please try again",
    canvasSelectTime: "Please select time",
    canvasSelectDateTime: "Please select date and time",
    canvasSelectDate: "Please select date",
    canvasAutoAddRow: "Rows can be added automatically when filling",
    satVeryDissatisfied: "Very dissatisfied",
    satDissatisfied: "Dissatisfied",
    satSomewhatDissatisfied: "Somewhat dissatisfied",
    satNeutral: "Neutral",
    satSomewhatSatisfied: "Somewhat satisfied",
    satSatisfied: "Satisfied",
    satVerySatisfied: "Very satisfied",

    // Panel labels (RightPanel, LeftPanel, CanvasTool, PageSetting, ComponentProp)
    panelProperties: "Properties",
    panelPageSettings: "Page Settings",
    panelComponentLib: "Components",
    panelLayers: "Layers",
    panelEndPage: "End Page",
    panelWorkTitle: "Survey Title",
    panelWorkTitlePlaceholder: "Enter title",
    panelWorkDesc: "Survey Description",
    panelWorkDescPlaceholder: "Survey description...",
    panelNoComponentSelected: "No component selected",
    panelSelectComponentHint: "Click a component on the canvas to edit",
  },

  // ─── Survey (answering components & pages) ──────
  survey: {
    // AnswerQuestionRenderer
    unknownQuestionType: "Unknown question type: {type}",

    // advanced.tsx
    clickToAddRank: "Click to add ranking:",
    clickToUpload: "Click to upload",
    maxFilesCount: "Up to {maxFiles} files",
    maxFileSize: "Each file up to {maxSize}MB",
    fileTooLarge: "File \"{name}\" exceeds the {maxSize}MB limit",
    imageOnlyHint: "Images only",
    signatureAlt: "Signature",
    resign: "Re-sign",
    clickToSign: "Click here to sign",
    signHint: "Please sign in the area below",
    signatureCanvasPlaceholder: "Signature canvas (requires canvas library)",
    geolocationUnsupported: "Geolocation is not supported on this device",
    gettingLocation: "Getting location...",
    getLocationFailed: "Failed to get location, please check permissions",
    locationNotObtained: "Location not obtained",
    getLocation: "Get location",
    optionCol: "Option",
    mostImportant: "Most important",
    leastImportant: "Least important",
    pleaseSelectLevel: "Please select {name}",

    // choice.tsx
    pleaseSelect: "Please select",
    noImage: "No image",

    // text.tsx
    pleaseInput: "Please enter...",
    blankN: "Blank {n}",
    noBlanksDetected: "No blanks detected",

    // matrix.tsx
    scoringCol: "Score",
    addRow: "Add a row",

    // scale.tsx
    npsMin: "0 = Extremely unlikely",
    npsMax: "10 = Extremely likely",
    effortEasy: "Easy",
    effortHard: "Hard",
    veryDissatisfied: "Very dissatisfied",
    dissatisfied: "Dissatisfied",
    neutral: "Neutral",
    satisfied: "Satisfied",
    verySatisfied: "Very satisfied",

    // s/[id]/page.tsx
    surveyDefaultName: "Survey",
    surveyNotFound: "Survey not found",
    surveyNotFoundDesc: "The survey may have been deleted or the link is incorrect. Please check and try again.",
    backToHome: "Back to home",
    loginRequiredTitle: "Login required",
    loginRequiredDesc: "This survey requires login to answer. Please log in first.",
    goLogin: "Go to login",
    surveyStoppedTitle: "Survey collection stopped",
    surveyStoppedDesc: "This survey has stopped collecting responses. Thank you for your interest.",
    surveyDeadlineTitle: "Survey closed",
    surveyDeadlineDesc: "This survey has passed the deadline and no longer accepts responses. Thank you for your interest.",
    submitSuccess: "Submitted successfully",
    thankYouDefault: "Thank you for your participation!",
    durationValue: "Duration {value}",
    pagesTotal: "{total} pages",
    viewStatsResults: "View statistics",
    closeBtn: "Close",
    submitFailed: "Submission failed, please try again",
    surveyFillTitle: "Survey",
    estimatedTime: "Est. 3-5 min",
    loginToAnswer: "Login required",
    pageProgress: "Page {current} / {total}",
    prevPage: "Previous",
    answeredCount: "Answered {count}",
    nextPage: "Next",
    submittingBtn: "Submitting...",
    submitSurvey: "Submit",
    autoSaveHint: "Content is auto-saved. You can return and continue at any time.",
    confirmLeaveTitle: "Confirm leaving?",
    confirmLeaveDesc: "You haven't submitted the survey yet. Leaving may lose your responses. The system has auto-saved your progress, and you can continue next time.",
    continueFilling: "Continue filling",
    confirmLeaveBtn: "Confirm leave",

    // share/[id]/page.tsx
    linkCopiedToast: "Survey link copied",
    loadingStats: "Loading statistics...",
    statsNotPublicTitle: "Statistics are not public",
    statsNotPublicDesc: "The survey statistics are not public. Please contact the survey creator.",
    surveyDefaultName2: "Survey",
    statsResultLabel: "Statistics",
    qrCodeBtn: "QR Code",
    copiedBtn: "Copied",
    copyLinkBtn: "Copy link",
    goToAnswerBtn: "Answer",
    publishedOn: "Published on {date}",
    collectionStopped: "Collection stopped",
    collecting: "Collecting",
    totalResponsesLabel: "Total responses",
    todayNewLabel: "Today's new",
    avgDurationLabel: "Avg duration",
    noStatsYet: "No statistics yet, waiting for the first response",
    goToAnswerBtn2: "Go to answer",
    scanToAnswerTitle: "Scan to answer",
    scanToAnswerDesc: "Scan the QR code below with WeChat, Alipay, etc. to start answering",
    votesCount: "{count} votes · {percentage}%",
    peopleAnswered: "{total} answered",
    noTextAnswers: "No text answers yet",
    unsupportedStatsType: "This question type does not support statistics display",
    secondUnit: "{seconds} sec",
    minuteSecondUnit: "{m} min {s} sec",
    backToWorkspace: "Back to workspace",

    // s/preview/[id]/page.tsx
    previewBadge: "Preview",
    previewHint: "Preview mode — responses are not saved",
    previewLoadFailed: "Failed to load preview",
    previewLoadFailedDesc: "The survey may not exist or you do not have permission to view it.",
    previewNoQuestions: "No questions yet",
    previewNoQuestionsDesc: "This survey has no questions. Add questions in the editor first.",
    previewEndOfSurvey: "End of survey",
    editInEditor: "Edit in editor",
  },

  // ─── Workspace ─────────────────────────────────
  workspace: {
    // layout.tsx
    navMySurveys: "My Surveys",
    navStats: "Statistics",
    navTemplates: "Templates",
    navTrash: "Trash",
    navUserManagement: "User Management",

    // page.tsx (home)
    filterAll: "All",
    filterDraft: "Draft",
    filterPublished: "Published",
    filterStopped: "Stopped",
    filterStarred: "Starred",
    createSuccessToast: "Survey created successfully",
    createFailedToast: "Creation failed, please try again",
    createDialogTitle: "Create new survey",
    createDialogLabel: "Survey title",
    createDialogPlaceholder: "Enter survey title, e.g. Customer Satisfaction Survey",
    cancelBtn: "Cancel",
    createAndEditBtn: "Create & edit",
    statusDraft: "Draft",
    statusStopped: "Stopped",
    statusPublished: "Published",
    linkCopiedToast: "Link copied to clipboard",
    stoppedCollectionToast: "Stopped collection for \"{name}\"",
    resumedCollectionToast: "Resumed collection for \"{name}\"",
    operationFailedToast: "Operation failed",
    surveyCopiedToast: "Survey copied",
    copyFailedToast: "Copy failed",
    movedToTrashToast: "Moved to trash",
    deleteFailedToast: "Delete failed",
    confirmToTemplate: "Are you sure you want to convert this survey to a template? Once converted, the survey content will be saved independently and will not affect each other.",
    convertedToTemplateToast: "\"{name}\" has been converted to a template",
    editMenu: "Edit",
    viewStatsMenu: "View statistics",
    previewMenu: "Preview",
    shareMenu: "Share",
    stopCollectionMenu: "Stop collection",
    resumeCollectionMenu: "Resume collection",
    copySurveyMenu: "Copy survey",
    toTemplateMenu: "Convert to template",
    deleteMenu: "Delete",
    deleteDialogDesc: "Move \"{name}\" to trash? You can restore it later from the trash.",
    deleteConfirmBtn: "Delete",
    copyDialogTitle: "Copy survey",
    copyDialogLabel: "Survey name",
    copyDialogPlaceholder: "Enter survey name",
    copyConfirmBtn: "Copy",
    untitledSurvey: "Untitled survey",
    previewBtn: "Preview",
    stopBtn: "Stop",
    shareBtn: "Share",
    shareDialogTitle: "Share \"{name}\"",
    answerLinkLabel: "Answer link",
    copiedBtn: "Copied",
    copyBtn: "Copy",
    answerLinkDesc: "Respondents fill out the survey via this link",
    statsLinkLabel: "Statistics link",
    statsLinkDesc: "Public statistics page showing real-time data",
    openAnswerPageBtn: "Open answer page",
    openSharePageBtn: "Open share page",
    loadListFailedToast: "Failed to load survey list",
    homeTitle: "My Surveys",
    homeDesc: "Manage all your surveys. Supports editing, publishing, and data analysis.",
    newSurveyBtn: "New survey",
    searchPlaceholder: "Search survey title",
    searchBtn: "Search",
    noMatchingSurveys: "No matching surveys found",
    clearFiltersBtn: "Clear filters",

    // profile/page.tsx
    applySubmittedToast: "Application submitted",
    applyFailedToast: "Application failed",
    roleRegular: "Regular user",
    roleAdmin: "Admin",
    roleSystemAdmin: "System admin",
    noPermissionHint: "No access. Please contact an administrator to upgrade your role.",
    applyStatusNone: "Not applied",
    applyStatusPending: "Under review",
    applyStatusApproved: "Approved",
    applyStatusRejected: "Rejected",
    profileTitle: "Profile",
    profileDesc: "View and manage your account information.",
    logoutBtn: "Log out",
    accountStatusLabel: "Account status:",
    blacklistedStatus: "Blacklisted",
    normalStatus: "Normal",
    registeredOn: "Registered on {date}",
    adminApplicationTitle: "Admin application",
    adminApplicationDesc:
      "Upgrade to admin to create and manage your own surveys in the workspace.",
    submittingBtn: "Submitting...",
    applyForAdminBtn: "Apply to become an admin",
    reapplyBtn: "Reapply",
    answeredSurveysTitle: "Answered surveys",
    answeredSurveysDesc: "Surveys you have participated in will appear here.",
    noAnsweredSurveys: "No answered surveys yet",
    goBrowse: "Browse surveys",
    startFilling: "to start filling",
    answeredAtLabel: "Answered: ",
    durationLabel: "Duration: ",
    scoreLabel: "Score: ",
    answeredCountLabel: "Answered {count} times",
    viewOrReanswerBtn: "View / Retake",
    loadAnsweredFailedToast: "Failed to load answered surveys",
    logoutDialogTitle: "Log out",
    logoutDialogDesc: "Are you sure you want to log out? You'll need to log in again to continue.",

    // trash/page.tsx
    loadTrashFailedToast: "Failed to load trash",
    restoredToast: "Restored",
    restoreFailedToast: "Restore failed",
    permanentlyDeletedToast: "Permanently deleted",
    trashTitle: "Trash",
    trashDesc: "Deleted surveys can be restored at any time. Permanent deletion cannot be undone.",
    colSurvey: "Survey",
    colStatus: "Status",
    colDeletedAt: "Deleted at",
    colActions: "Actions",
    restoreBtn: "Restore",
    permanentlyDeleteBtn: "Permanently delete",
    trashEmpty: "Trash is empty",
    restoreDialogTitle: "Restore survey",
    restoreDialogDesc: "Are you sure you want to restore \"{name}\"? It will be available in \"My Surveys\" after restoration.",
    confirmRestoreBtn: "Confirm restore",
    permanentlyDeleteDialogTitle: "Permanently delete",
    permanentlyDeleteDialogDesc: "Are you sure you want to permanently delete \"{name}\"? This action cannot be undone and all related data will be permanently lost.",
    permanentDeleteBtn: "Permanently delete",

    // templates/page.tsx
    createdFromTemplateToast: "Survey created from template",
    createFailedToast2: "Creation failed",
    createdBy: "Created by {name}",
    systemUser: "System",
    usageCount: "Used {count} times",
    useTemplateBtn: "Use this template",
    loadTemplatesFailedToast: "Failed to load templates",
    templatesTitle: "Templates",
    templatesDesc: "Quickly create surveys from curated templates covering common business scenarios.",
    noTemplates: "No templates yet",
    noTemplatesDesc: "System admins can convert surveys to templates from the survey list.",
    previewTemplateTitle: "Template preview",
    previewTemplateDesc: "This is a preview of the template. Answers will not be saved.",
    previewTemplateLoadFailed: "Failed to load template content",
    questionCount: "{count} questions",

    // stats/page.tsx
    statsTitle: "Statistics",
    statsDesc: "Select a survey to view detailed statistics",
    noSurveys: "No surveys yet",

    // stats/[id]/page.tsx
    loadStatsFailedToast: "Failed to load statistics",
    statsDetailTitle: "Statistics",
    surveyStatsDefault: "Survey statistics",
    selectSurveyPlaceholder: "Select survey",
    totalResponsesCard: "Total responses",
    todayNewCard: "Today's new",
    avgDurationCard: "Avg duration",
    statusCard: "Status",
    statusCollecting: "Collecting",
    statusUnpublished: "Unpublished",
    weeklyTrendTitle: "7-day response trend",
    weeklyTrendDesc: "Daily new responses",
    exportBtn: "Export",
    questionDistributionTitle: "Question response distribution",
    responseCount: "{count} responses · {percentage}%",
    noData: "No data",
    noAnswerData: "No response data",
    weekNewCard: "This week",
    medianDurationCard: "Median duration",
    fastestDurationCard: "Fastest",
    slowestDurationCard: "Slowest",
    trend7Days: "7 days",
    trend30Days: "30 days",
    hourlyTitle: "Hourly response distribution",
    hourlyDesc: "Response time-of-day distribution (Beijing time)",
    deviceTitle: "Device & source distribution",
    deviceTypeLegend: "Device type",
    browserLegend: "Browser",
    osLegend: "OS",
    devicePC: "PC",
    deviceMobile: "Mobile",
    deviceTablet: "Tablet",
    unknownLabel: "Unknown",
    peopleCount: "{count}",

    // user-management/page.tsx
    loadUsersFailedToast: "Failed to load user list",
    setAdminToast: "Set {username} as admin",
    unblacklistedToast: "Unblacklisted",
    blacklistedUserToast: "User blacklisted",
    applyApprovedToast: "Application approved",
    applyRejectedToast: "Application rejected",
    pendingReview: "Pending review",
    userManagementTitle: "User management",
    userManagementDesc: "Manage all users' roles, status, and admin applications.",
    allUsersTab: "All users",
    pendingApplicationsTab: "Pending applications",
    noPendingApplications: "No pending admin applications",
    noUserData: "No user data",
    colUser: "User",
    colEmail: "Email",
    colRole: "Role",
    colApplyStatus: "Application status",
    approveBtn: "Approve",
    rejectBtn: "Reject",
    setAdminBtn: "Set as admin",
    unblacklistBtn: "Unblacklist",
    blacklistBtn: "Blacklist",
    paginationInfo: "Total {total} items, page {page} / {totalPages}",
    prevPage: "Previous",
    nextPage: "Next",
    setAdminDialogTitle: "Set as admin",
    setAdminDialogDesc: "Are you sure you want to set \"{username}\" as admin? This user will gain permissions to create and manage surveys.",
    confirmSetAdminBtn: "Confirm",
    unblacklistDialogTitle: "Unblacklist",
    unblacklistDialogDesc: "Are you sure you want to unblacklist \"{username}\"?",
    confirmUnblacklistBtn: "Confirm",
    blacklistDialogTitle: "Blacklist user",
    blacklistDialogDesc: "Are you sure you want to blacklist \"{username}\"? The user will not be able to log in.",
    confirmBlacklistBtn: "Confirm",
    approveApplicationDialogTitle: "Approve application",
    approveApplicationDialogDesc: "Are you sure you want to approve \"{username}\"'s admin application?",
    rejectApplicationDialogTitle: "Reject application",
    rejectApplicationDialogDesc: "Are you sure you want to reject \"{username}\"'s admin application?",
  },

  // ─── Auth Pages ────────────────────────────────
  authPages: {
    // signin/page.tsx
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
    loginFailed: "Login failed, please try again",
    welcomeBack: "Welcome back",
    signinSubtitle: "Sign in to your account to continue",
    usernameLabel: "Username",
    usernamePlaceholder: "Enter username",
    passwordLabel: "Password",
    forgotPasswordLink: "Forgot password?",
    passwordPlaceholder: "Enter password",
    signingInBtn: "Signing in...",
    signInBtn: "Sign in",
    noAccountPrefix: "Don't have an account?",
    signUpLink: "Sign up",

    // signup/page.tsx
    usernameLength: "Username must be 3-20 characters",
    usernameFormat: "Username can only contain letters, numbers, and underscores",
    emailRequired: "Email is required",
    emailFormat: "Invalid email format",
    passwordLength: "Password must be 6-30 characters",
    passwordFormat: "Password must contain uppercase, lowercase, and numbers",
    passwordMismatch: "Passwords do not match",
    mustAgree: "Please agree to the terms of service",
    captchaRequired: "Please complete the captcha verification",
    captchaHint: "Security verification will start automatically when you submit",
    signupFailed: "Sign up failed, please try again",
    signupSuccess: "Registration successful",
    activationEmailSent: "Activation email has been sent to {email}. Please check your email and click the activation link to activate your account.",
    goSignInBtn: "Go to sign in",
    createAccountTitle: "Create your account",
    signupSubtitle: "Fill in your information to register. We will send an activation email to your inbox.",
    emailLabel: "Email",
    usernamePlaceholderSignup: "3-20 letters, numbers, or underscores",
    passwordPlaceholderSignup: "6-30 chars, with upper/lower case and numbers",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Enter password again",
    captchaLabel: "Captcha",
    agreePrefix: "I have read and agree to the",
    and: "and",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    submittingBtn: "Submitting...",
    signUpBtn: "Sign up",
    haveAccountPrefix: "Already have an account?",
    signInLink: "Sign in",

    // forgot-password/page.tsx
    sendFailed: "Send failed, please try again",
    emailSentTitle: "Email sent",
    emailSentDesc: "If the email is registered, a password reset email has been sent to {email}. Please check your email and click the reset link.",
    backToSignInBtn: "Back to sign in",
    forgotPasswordTitle: "Forgot password",
    forgotPasswordDesc: "Enter your registered email. We will send a password reset link to your email.",
    sendingBtn: "Sending...",
    sendResetLinkBtn: "Send reset link",
    rememberPasswordPrefix: "Remembered?",

    // reset-password/page.tsx
    invalidLinkMissingParams: "Invalid link, missing required parameters",
    invalidLinkExpired: "Invalid or expired link",
    resetFailed: "Reset failed, please try again",
    resetPasswordTitle: "Reset password",
    resetPasswordNoLinkDesc: "Please get a reset link via the forgot password process.",
    goForgotPasswordBtn: "Go to forgot password",
    resetSuccessTitle: "Password reset successfully",
    resetSuccessDesc: "Your password has been reset. Please log in with your new password.",
    verifyingTitle: "Verifying...",
    verifyingDesc: "Please wait, verifying reset link",
    invalidLinkTitle: "Invalid link",
    invalidLinkDesc: "The reset link is invalid or expired. Please apply again.",
    reapplyResetBtn: "Reapply for reset",
    setNewPasswordTitle: "Set new password",
    setNewPasswordDesc: "Please enter your new password. It must contain uppercase, lowercase, and numbers.",
    newPasswordLabel: "New password",
    confirmNewPasswordLabel: "Confirm new password",
    confirmNewPasswordPlaceholder: "Enter new password again",
    resetPasswordBtn: "Reset password",

    // activate/page.tsx
    activateFailed: "Activation failed, please try again",
    activatingTitle: "Activating...",
    activatingDesc: "Please wait, verifying your activation link",
    activateSuccessTitle: "Activation successful",
    activateSuccessDesc: "Your account has been activated. You can now log in.",
    activateFailedTitle: "Activation failed",
    reregisterBtn: "Register again",

    // AliyunCaptcha.tsx
    clickToVerify: "Click to verify",
    captchaAppIdMissing: "Captcha is not configured (missing prefix or SceneId)",
    captchaSdkLoadFailed: "Captcha SDK failed to load",
    captchaVerifyFailed: "Verification failed, please try again",
    captchaLoadFailed: "Captcha failed to load, please refresh the page",
    verified: "✓ Verified",
    loadingBtn: "Loading...",
  },

  // ─── About ────────────────────────────────────
  about: {
    pageTitle: "Life and Passion",
    pageSubtitle:
      "Beyond the code, find the joy of living in the balance between action and stillness — whether racing on a motorcycle, fishing by the water, or riding the waves.",

    timelineTitle: "Career Development Journey",
    timelineSubtitle:
      "With over a decade of experience in front-end R&D, I have grown from foundational development into engineering architecture, continuously refining my technical expertise and end-to-end delivery capabilities.",

    timeline: {
      y2014: {
        year: "2014 - 2017",
        label: "start",
        title: "Building the Front-end Foundation",
        description:
          "Developed marketing pages, handled cross-browser compatibility and multi-device adaptation, and honed efficient development and troubleshooting skills.",
      },
      y2017: {
        year: "2017 - 2019",
        label: "engineering shift",
        title: "Moving Into the Internet, Deepening Front-end Engineering",
        description:
          "Built technical architecture, encapsulated reusable components, optimized builds and performance, and picked up TypeScript back-end fundamentals.",
      },
      y2019: {
        year: "2019 - 2021",
        label: "education sector",
        title: "Upholding R&D Standards, Optimizing Large-scale Architecture",
        description:
          "Implemented standardized processes, decomposed complex business logic, iterated on architecture, and kept high-concurrency services running stably.",
      },
      y2021: {
        year: "2021 - Present",
        label: "big tech",
        title: "Diving Into Architecture Design, Strengthening the R&D System",
        description:
          "Led project architecture setup and iteration, built full-stack features with TypeScript, and combined design skills to ship products.",
      },
    },

    ecosystemTitle: "R&D & Design System",
    ecosystemSubtitle:
      "A comprehensive capability framework spanning TypeScript back-end development, 3D visualization, AI-powered applications, algorithms and creative design.",

    ecosystemTags: {
      tag1: "Front-end Development",
      tag2: "React Ecosystem",
      tag3: "Full-stack",
      tag4: "3D Visualization",
      tag5: "AI-powered Coding",
      tag6: "Product Design",
      tag7: "Creative Design",
      tag8: "Data Structures & Algorithms",
      tag9: "Hands-on Engineering",
      tag10: "Code Quality",
      tag11: "Databases & Services",
      tag12: "Containers & DevOps",
      tag13: "Agent Development",
      tag14: "Project Architecture",
    },

    heroImageAlt: "About page hero background",
    teamImageAlt: "Team photo {index}",
  },

  // ─── Privacy ──────────────────────────────────
  privacy: {
    pageTitle: "Privacy Policy",
    /** 用 format 注入 `{date}` */
    lastUpdated: "Last updated: {date}",
    section1Heading: "1. Information We Collect",
    section1Body:
      "When you create an account, we collect the name and email you voluntarily provide and store a bcrypt hash of your password — we never store, and cannot recover, your plaintext password. While you use the site, our servers may log access metadata (IP address, user agent, timestamp) solely for troubleshooting and abuse detection.",
    section2Heading: "2. How We Use Your Information",
    section2Intro: "We use your information only for the following purposes:",
    section2Item1: "To identify you and provide signed-in functionality;",
    section2Item2:
      "To contact you about material changes or security incidents affecting the site;",
    section2Item3:
      "To comply with applicable laws and respond to lawful requests from public authorities.",
    section2Outro:
      "We do not sell or share your personal information with third parties for commercial purposes.",
    section3Heading: "3. Cookies & Sessions",
    /**
     * 含内嵌 <code>session_token</code> 的段落分两半，
     * 中间在组件里插入 inline <code> 元素。
     */
    section3BodyPart1: "Upon successful sign-in we set an HttpOnly cookie named",
    section3BodyPart2:
      "used by the server to identify your signed-in state. This cookie cannot be read by JavaScript and is valid for 1 day by default; selecting “Keep me signed in” extends it to 7 days.",
    section4Heading: "4. Your Rights",
    section4Body:
      "You may request to access, correct, or delete the personal information associated with your account at any time via the contact methods listed on the site. We will respond within a reasonable timeframe.",
    section5Heading: "5. Changes to This Policy",
    section5Body:
      "We may update this policy from time to time. Material changes will be highlighted on the site, and your continued use of the site constitutes acceptance of the updated policy.",
  },

  // ─── Terms ────────────────────────────────────
  terms: {
    pageTitle: "Terms & Conditions",
    /** 用 format 注入 `{date}` */
    lastUpdated: "Last updated: {date}",
    section1Heading: "1. Acceptance of Terms",
    section1Body:
      "Welcome. By creating an account or using any feature of this site, you agree to be bound by these Terms. We may revise these Terms at any time without prior notice; the revised version becomes effective once published on this page.",
    section2Heading: "2. Acceptable Use",
    section2Body:
      "You agree to use this site lawfully and in accordance with generally accepted community standards. You shall not upload or publish content that is illegal, infringing, fraudulent, harassing, or contains malicious code; nor shall you access, scrape, or attack the site by automated means without prior written authorization.",
    section3Heading: "3. Disclaimer of Warranties",
    section3Body:
      'This site is provided on an “as is” and “as available” basis. To the fullest extent permitted by applicable law, we make no express or implied warranties regarding the accuracy, completeness, availability, or third-party content of the site, and we shall not be liable for any direct or indirect damages arising from your use of the site.',
    section4Heading: "4. Account Security",
    section4Body:
      "You are responsible for safeguarding your account credentials. Any loss arising from a leak of your account information is your sole responsibility. If you suspect unauthorized access or login activity, please change your password immediately and contact the site administrator.",
    section5Heading: "5. Contact",
    section5Body:
      "For any questions regarding these Terms, please reach us via the contact methods listed in the footer.",
    section6Heading: "6. Content Disclaimer",
    section6Body:
      "The content displayed and published on this site is aggregated from the internet and is intended for reference purposes only. If you identify any specific issues regarding the content, please provide details and contact us; we will promptly remove or delete the relevant material upon addressing the matter.",
  },

  // ─── Resources ────────────────────────────────
  resourcesPage: {
    heroTitle: "Handpicked Resources",
    heroSubtitle:
      "A curated list of high-quality external resources I rely on every day for work, learning, and creating — organized by category for quick access.",

    /** 底部 CTA */
    ctaTitle: "Got a hidden gem to share?",
    ctaSubtitle:
      "Tell me about a great site you've stashed away — let's make this list more useful together.",
    ctaButton: "Suggest a resource",

    /** 分类元信息 + 每个链接的标题与描述，按 id 索引 */
    categories: {
      frontend: {
        title: "Frontend",
        subtitle: "Frontend frameworks, UI components and styling tools",
        links: {
          nextjs: {
            title: "Next.js",
            description:
              "Production-grade React framework with SSR / SSG / RSC support",
          },
          tailwind: {
            title: "Tailwind CSS",
            description: "A utility-first atomic CSS framework",
          },
          shadcn: {
            title: "shadcn/ui",
            description:
              "Copy-paste component collection built on Radix + Tailwind",
          },
          shadcnblocks: {
            title: "shadcnblocks",
            description:
              "High-quality blocks and page templates built on shadcn/ui",
          },
          lucide: {
            title: "Lucide Icons",
            description: "Beautiful, consistent, ready-to-use icon library",
          },
        },
      },
      design: {
        title: "Design",
        subtitle: "Inspiration sources for UI, visuals and design systems",
        links: {
          dribbble: {
            title: "Dribbble",
            description:
              "Global designer portfolios and a visual inspiration community",
          },
          behance: {
            title: "Behance",
            description: "Adobe's creative work showcase platform",
          },
          mobbin: {
            title: "Mobbin",
            description:
              "Massive library of real app screenshots to study UX patterns",
          },
        },
      },
      backend: {
        title: "Backend & Infra",
        subtitle: "Backend frameworks, databases and cloud infrastructure",
        links: {
          prisma: {
            title: "Prisma",
            description: "Type-safe next-gen ORM for Node.js / TypeScript",
          },
          vercel: {
            title: "Vercel",
            description: "Frontend-first global edge deployment platform",
          },
          cloudflare: {
            title: "Cloudflare",
            description: "CDN, edge compute and global network services",
          },
          supabase: {
            title: "Supabase",
            description: "Open-source Firebase alternative powered by Postgres",
          },
        },
      },
      productivity: {
        title: "Productivity",
        subtitle: "Power tools to boost your day-to-day work",
        links: {
          notion: {
            title: "Notion",
            description: "All-in-one docs, databases and collaboration space",
          },
          linear: {
            title: "Linear",
            description: "Project management built for fast-moving teams",
          },
          raycast: {
            title: "Raycast",
            description: "Extensible launcher and productivity hub for macOS",
          },
          arc: {
            title: "Arc",
            description: "A modern browser that rethinks how we browse",
          },
        },
      },
      learning: {
        title: "Learning",
        subtitle: "High-quality resources for continuous growth",
        links: {
          mdn: {
            title: "MDN Web Docs",
            description: "Authoritative reference for the web platform",
          },
          freecodecamp: {
            title: "freeCodeCamp",
            description: "Free, structured learn-to-code community",
          },
          frontendmasters: {
            title: "Frontend Masters",
            description: "Advanced frontend courses taught by industry experts",
          },
          patternsdev: {
            title: "Patterns.dev",
            description: "Modern web app patterns and best practices",
          },
        },
      },
      community: {
        title: "Community",
        subtitle: "Find your people, discuss and share",
        links: {
          stackoverflow: {
            title: "Stack Overflow",
            description: "The hub for developer Q&A and technical discussion",
          },
        },
      },
    },
  },

  // ─── Contact page ──────────────────────────────
  contactPage: {
    pageTitle: "Feel free to contact me",

    // ── 表单字段标签 / placeholder ──
    firstNameLabel: "First Name",
    firstNamePlaceholder: "Enter your first name",
    lastNameLabel: "Last Name",
    lastNamePlaceholder: "Enter your last name",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email address",
    subjectLabel: "Subject",
    subjectPlaceholder: "How can we help you?",
    countryLabel: "Country",
    countrySelectPlaceholder: "— Select —",
    messageLabel: "Message",
    messagePlaceholder: "Write your message",

    // ── 国家列表（value 用英文 token，label 走翻译）──
    countryUS: "United States",
    countryUK: "United Kingdom",
    countryDE: "Germany",
    countryFR: "France",
    countryJP: "Japan",
    countryCN: "China",
    countryOther: "Other",

    // ── 按钮 / 蜜罐 ──
    submitButton: "Send",
    submitting: "Sending…",
    // 蜜罐字段 label，仅辅助技术用，正常用户看不到
    honeypotLabel: "Company website (do not fill)",

    // ── 校验错误 ──
    errorEnterName: "Please enter your name",
    errorEnterEmail: "Please enter your email",
    errorEnterSubject: "Please enter a subject",
    // {n} 替换为留言长度上限
    errorMessageTooLong: "Message must be {n} characters or fewer",
    errorTooFrequent:
      "You're submitting too frequently. Please try again later.",
    errorNetwork: "Network error. Please try again later.",

    // ── 成功态 ──
    successTitle: "Message sent",
    successDesc: "Thanks for reaching out — we'll get back to you soon.",
    sendAnother: "Send another",

    // ── 服务条款 / 隐私 同意行（前后缀 + 两个链接文案分开）──
    consentBefore:
      "By clicking \u201CSend\u201D you consent to allow us to store and process the personal information submitted above and agree to our",
    consentTerms: "terms & conditions",
    consentMiddle: "as well as our",
    consentPrivacy: "Privacy Policy",
    consentAfter: ".",
  },

  // ─── Home（DocsArticle DESIGN 列表：Featured / Latest / Popular）────
  home: {
    heroTitle: "Design stories worth sharing",
    heroSubtitle:
      "Discover the thinking behind every great design. Explore curated stories, in-depth documentation, and the craft journeys that shape the products people love.",
    /** Hero 署名占位文案（静态展示，不随文章变化） */
    heroByline: "By Micheal Osman · Nov 2, 2020",
    heroAuthorName: "Micheal Osman",
    heroImageAlt: "Home hero background",
    /** `By {name} · {date}` 模板，占位符由 `format()` 替换 */
    byAuthorDate: "By {name} · {date}",
    byPrefix: "By",
    anonymous: "Anonymous",
    latest: "Latest",
    popularOnSimple: "Popular on Simple",
    seePreviousArticles: "See previous articles",
    loading: "Loading…",
    noProjectsTitle: "No Projects Yet",
    noProjectsDescription:
      "No data is currently available for your selected language environment. Please try contacting us.",
    learnMore: "Learn More",
    /** 仅登录可见角标（匿名访客才看得到） */
    loginRequiredBadge: "Login required",
  },

  // ─── Blog / article detail（/blog/[uuid]）────────────────────────
  blog: {
    byPrefix: "By",
    anonymous: "Anonymous",
    relatedTitle: "Related articles",
    backToHome: "Back to home",
    loading: "Loading…",
    /** 匿名访问「仅登录可见」文章时的占位卡 */
    loginRequiredTitle: "Login required",
    loginRequiredDesc:
      "This article is only available to signed-in users. Please sign in to continue reading.",
    signIn: "Sign in",

    /** 面包屑根节点（分类链由后端返回，这里补一个可点首页） */
    breadcrumbHome: "Home",
    /** 上下篇导航（后端 siblings） */
    prevArticle: "Prev",
    nextArticle: "Next",

    /** 文章反馈（四档情绪，需登录） */
    feedbackTitle: "Was this helpful?",
    feedbackSignInHint: "(Sign in to give feedback)",
    feedbackSignInTitle: "Please sign in to give feedback",
    feedbackNotHelpful: "No, it didn't help",
    feedbackConfused: "Still feel confused",
    feedbackGood: "Sounds good!",
    feedbackExcellent: "Excellent article",
  },

  // ─── Common ────────────────────────────────────
  // ─── Docs index（/docs）────────────────────────
  docsIndex: {
    title: "The Journey of Knowledge",
    subtitle:
      "My memory is poor, so I commit everything to writing for safekeeping.",
    heroImageAlt: "Documentation hero background",
    /** `{n}` 替换为数字；单数为另一条文案，避免 "1 articles" */
    countOne: "1 article",
    countMany: "{n} articles",
    /** 筛选条上的「全部」chip */
    categoryAll: "All categories",
    searchPlaceholder: "Search articles…",
    /** 应用筛选后的空结果提示 */
    noResults: "No articles match your filters.",
    clearFilters: "Clear filters",
    /** 卡片右上角「热门」角标 */
    tagHot: "Hot",
    /** 顶部运营推荐区块标题 */
    featuredTitle: "Featured",
    /** 相对时间 */
    timeJustNow: "just now",
    timeMinutesAgo: "{n} minutes ago",
    timeHoursAgo: "{n} hours ago",
    timeDaysAgo: "{n} days ago",
    timeMonthsAgo: "{n} months ago",
    timeYearsAgo: "{n} years ago",
  },

  // ─── Search modal（全站搜索框）────────────────
  search: {
    triggerAria: "Search",
    /** 触发按钮文案（单条，x≤md 用 200px 容器，文案会被截断） */
    triggerLabel: "Search…",
    inputPlaceholder: "Search for anything…",
    searching: "Searching…",
    documents: "Documents",
    designs: "Designs",
    hotDocuments: "Hot documents",
    hotDesigns: "Hot designs",
    noResults: "No results found.",
    noHotDocuments: "No hot documents yet.",
    noHotDesigns: "No hot designs yet.",
    actions: "Actions",
    submitFeedback: "Submit feedback",
  },

  // ─── Docs detail（/docs/[uuid]）────────────────
  docsDetail: {
    /** 移动端侧边栏开合按钮的无障碍名 */
    toggleSidebar: "Toggle documentation menu",
    /** 侧边栏 nav 的无障碍名 */
    sidebarNav: "Documentation navigation",
    /**
     * 文档头部图标旁的固定标题，同时兼作面包屑根节点（可点，跳 /docs）。
     * 分类链由后端 breadcrumbs 返回，只有它有 href。
     */
    headerTitle: "Documentation",
    /** 右侧目录标题 */
    onThisPage: "On this page",
    /** 上下篇导航（后端 siblings） */
    siblingsNav: "More docs",
    prevArticle: "Prev",
    nextArticle: "Next",
    /** 匿名访问「仅登录可见」文档时的占位卡 */
    loginRequiredTitle: "Login required",
    loginRequiredDesc:
      "This document is only available to signed-in users. Please sign in to continue reading.",
    signIn: "Sign in",
    backToDocs: "Back to docs",
    /** 正文 sections 为空时的提示 */
    noContent: "This document has no content yet.",
  },

  // ─── Profile (/profile) ────────────────────────
  profile: {
    title: "Profile",
    desc: "View and manage your account information.",
    activityTitle: "My activity",
    activityTodoTitle: "Nothing here yet",
    activityTodoDesc: "Your reactions on blog posts and docs will show up here.",
    feedbacksCount: "{count} in total",
    feedbacksLoadFailed: "Failed to load your activity",
    typeBlog: "Blog",
    typeDocs: "Docs",
    retry: "Retry",
    loginRequiredTitle: "Sign in to view your profile",
    loginRequiredDesc: "Your profile is only visible when you are signed in.",
  },

  common: {
    switchToZh: "Switch to Chinese",
    switchToEn: "Switch to English",
    switchTheme: "Switch to light / dark version",
    qrCodeAlt: "QR Code",
  },
} as const;

export type Messages = typeof en;