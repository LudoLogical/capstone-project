/**
 *
 */
export type BaseDatum = {
  /**
   *
   */
  content: string;

  /**
   *
   */
  source: string;

  /**
   *
   */
  evaluateMethod: "bar" /* | "other" | "things" | ... */; // TODO
};

/**
 *
 */
export type AuthoritativeDatum = BaseDatum & {
  /**
   *
   */
  location: Location;

  /**
   *
   */
  value: number;

  /**
   *
   */
  unit: string;

  /**
   *
   */
  context: {
    /**
     *
     */
    minimum: number;

    /**
     *
     */
    average: number;

    /**
     *
     */
    maximum: number;
  };

  // All AuthoritativeData must be visualized using a bar chart
  evaluateMethod: "bar";
};

/**
 *
 */
export type NSRServiceDatum = BaseDatum & {
  /**
   *
   */
  service: "BMS" | "IAS" | "OAT";

  // TODO: Waiting on an enumeration of desired inputs and outputs
  // TODO: Waiting on evaluate method(s)
};

/**
 *
 */
export type BaseInitiativeDatum = BaseDatum & {
  /**
   *
   */
  content: string;

  /**
   *
   */
  folder: string;

  /**
   *
   */
  isDeleted: boolean;

  // TODO: Waiting on evaluate method(s)
};

/**
 *
 */
export type WebsiteDatum = BaseInitiativeDatum & {
  /**
   *
   */
  link: string;

  // TODO: Waiting on evaluate method(s)
};

/**
 *
 */
export type DocumentDatum = BaseInitiativeDatum & {
  /**
   *
   */
  file: File;

  /**
   *
   */
  name: string;

  /**
   *
   */
  type: "txt" | "md" | "doc" | "docx" | "csv" | "xlsx" | "ppt" | "pptx" | "pdf";

  // TODO: Waiting on evaluate method(s)
};

/**
 *
 */
export type ChatInferenceDatum = BaseInitiativeDatum & {
  /**
   *
   */
  responseID: string;

  // TODO: Waiting on evaluate method(s)
};

/**
 *
 */
export type InitiativeDatum = WebsiteDatum | DocumentDatum | ChatInferenceDatum;
