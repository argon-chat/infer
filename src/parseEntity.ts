// based on from Ajaxy/telegram-tt
// GNU GENERAL PUBLIC LICENSE

export type ApiMessageEntityDefault = {
  type: Exclude<
    `${ApiMessageEntityTypes}`,
    | `${ApiMessageEntityTypes.Pre}`
    | `${ApiMessageEntityTypes.TextUrl}`
    | `${ApiMessageEntityTypes.MentionName}`
    | `${ApiMessageEntityTypes.CustomEmoji}`
    | `${ApiMessageEntityTypes.Blockquote}`
    | `${ApiMessageEntityTypes.Timestamp}`
  >;
  offset: number;
  length: number;
};

export type ApiMessageEntityPre = {
  type: ApiMessageEntityTypes.Pre;
  offset: number;
  length: number;
  language?: string;
};

export type ApiMessageEntityTextUrl = {
  type: ApiMessageEntityTypes.TextUrl;
  offset: number;
  length: number;
  url: string;
};

export type ApiMessageEntityMentionName = {
  type: ApiMessageEntityTypes.MentionName;
  offset: number;
  length: number;
  userId: string;
};

export type ApiMessageEntityBlockquote = {
  type: ApiMessageEntityTypes.Blockquote;
  offset: number;
  length: number;
  canCollapse?: boolean;
};

export type ApiMessageEntityCustomEmoji = {
  type: ApiMessageEntityTypes.CustomEmoji;
  offset: number;
  length: number;
  documentId: string;
};

export type ApiMessageEntityTimestamp = {
  type: ApiMessageEntityTypes.Timestamp;
  offset: number;
  length: number;
  timestamp: number;
};

export enum ApiMessageEntityTypes {
  Bold = "MessageEntityBold",
  Blockquote = "MessageEntityBlockquote",
  BotCommand = "MessageEntityBotCommand",
  Cashtag = "MessageEntityCashtag",
  Code = "MessageEntityCode",
  Email = "MessageEntityEmail",
  Hashtag = "MessageEntityHashtag",
  Italic = "MessageEntityItalic",
  MentionName = "MessageEntityMentionName",
  Mention = "MessageEntityMention",
  Phone = "MessageEntityPhone",
  Pre = "MessageEntityPre",
  Strike = "MessageEntityStrike",
  TextUrl = "MessageEntityTextUrl",
  Url = "MessageEntityUrl",
  Underline = "MessageEntityUnderline",
  Spoiler = "MessageEntitySpoiler",
  CustomEmoji = "MessageEntityCustomEmoji",
  Timestamp = "MessageEntityTimestamp",
  Unknown = "MessageEntityUnknown",
}

export type ApiMessageEntity =
  | ApiMessageEntityDefault
  | ApiMessageEntityPre
  | ApiMessageEntityTextUrl
  | ApiMessageEntityMentionName
  | ApiMessageEntityCustomEmoji
  | ApiMessageEntityBlockquote
  | ApiMessageEntityTimestamp;
export const MAX_TAG_DEEPNESS = 3;

export const ENTITY_CLASS_BY_NODE_NAME: Record<string, ApiMessageEntityTypes> =
  {
    B: ApiMessageEntityTypes.Bold,
    STRONG: ApiMessageEntityTypes.Bold,
    I: ApiMessageEntityTypes.Italic,
    EM: ApiMessageEntityTypes.Italic,
    INS: ApiMessageEntityTypes.Underline,
    U: ApiMessageEntityTypes.Underline,
    S: ApiMessageEntityTypes.Strike,
    STRIKE: ApiMessageEntityTypes.Strike,
    DEL: ApiMessageEntityTypes.Strike,
    CODE: ApiMessageEntityTypes.Code,
    PRE: ApiMessageEntityTypes.Pre,
    BLOCKQUOTE: ApiMessageEntityTypes.Blockquote,
  };
export const RE_LINK_TEMPLATE =
  "((ftp|https?):\\/\\/)?((www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z][-a-zA-Z0-9]{1,62})\\b([-a-zA-Z0-9()@:%_+.,~#?&/=]*)";
export function parseMarkdownLinks(html: string) {
  return html.replace(
    new RegExp(`\\[([^\\]]+?)]\\((${RE_LINK_TEMPLATE}+?)\\)`, "g"),
    (_, text, link) => {
      const url = link.includes("://")
        ? link
        : link.includes("@")
        ? `mailto:${link}`
        : `https://${link}`;
      return `<a href="${url}">${text}</a>`;
    }
  );
}

function parseMarkdown(html: string) {
  let parsedHtml = html.slice(0);

  // Strip redundant nbsp's
  parsedHtml = parsedHtml.replace(/&nbsp;/g, " ");

  // Replace <div><br></div> with newline (new line in Safari)
  parsedHtml = parsedHtml.replace(/<div><br([^>]*)?><\/div>/g, "\n");
  // Replace <br> with newline
  parsedHtml = parsedHtml.replace(/<br([^>]*)?>/g, "\n");

  // Strip redundant <div> tags
  parsedHtml = parsedHtml.replace(/<\/div>(\s*)<div>/g, "\n");
  parsedHtml = parsedHtml.replace(/<div>/g, "\n");
  parsedHtml = parsedHtml.replace(/<\/div>/g, "");

  // Pre
  parsedHtml = parsedHtml.replace(
    /^`{3}(.*?)[\n\r](.*?[\n\r]?)`{3}/gms,
    '<pre data-language="$1">$2</pre>'
  );
  parsedHtml = parsedHtml.replace(
    /^`{3}[\n\r]?(.*?)[\n\r]?`{3}/gms,
    "<pre>$1</pre>"
  );
  parsedHtml = parsedHtml.replace(/[`]{3}([^`]+)[`]{3}/g, "<pre>$1</pre>");

  // Code
  parsedHtml = parsedHtml.replace(
    /(?!<(code|pre)[^<]*|<\/)[`]{1}([^`\n]+)[`]{1}(?![^<]*<\/(code|pre)>)/g,
    "<code>$2</code>"
  );

  // Prepare alt text for custom emoji
  parsedHtml = parsedHtml.replace(/\[<img[^>]+alt="([^"]+)"[^>]*>]/gm, "[$1]");
  parsedHtml = parsedHtml.replace(
    /(?!<(?:code|pre)[^<]*|<\/)\[([^\]\n]+)\]\(customEmoji:(\d+)\)(?![^<]*<\/(?:code|pre)>)/g,
    '<img alt="$1" data-document-id="$2">'
  );

  // Other simple markdown
  parsedHtml = parsedHtml.replace(
    /(?!<(code|pre)[^<]*|<\/)[*]{2}([^*\n]+)[*]{2}(?![^<]*<\/(code|pre)>)/g,
    "<b>$2</b>"
  );
  parsedHtml = parsedHtml.replace(
    /(?!<(code|pre)[^<]*|<\/)[_]{2}([^_\n]+)[_]{2}(?![^<]*<\/(code|pre)>)/g,
    "<i>$2</i>"
  );
  parsedHtml = parsedHtml.replace(
    /(?!<(code|pre)[^<]*|<\/)[~]{2}([^~\n]+)[~]{2}(?![^<]*<\/(code|pre)>)/g,
    "<s>$2</s>"
  );
  parsedHtml = parsedHtml.replace(
    /(?!<(code|pre)[^<]*|<\/)[|]{2}([^|\n]+)[|]{2}(?![^<]*<\/(code|pre)>)/g,
    `<span data-entity-type="${ApiMessageEntityTypes.Spoiler}">$2</span>`
  );

  return parsedHtml;
}

export function parseHtmlAsFormattedText(
  html: string,
  withMarkdownLinks = false,
  skipMarkdown = false
): ApiFormattedText {
  const fragment = document.createElement("div");
  fragment.innerHTML = skipMarkdown
    ? html
    : withMarkdownLinks
    ? parseMarkdown(parseMarkdownLinks(html))
    : parseMarkdown(html);
  fixImageContent(fragment);
  const text = fragment.innerText.trim().replace(/\u200b+/g, "");
  const trimShift = fragment.innerText.indexOf(text[0]);
  let textIndex = -trimShift;
  let recursionDeepness = 0;
  const entities: ApiMessageEntity[] = [];

  function addEntity(node: ChildNode) {
    if (node.nodeType === Node.COMMENT_NODE) return;
    const { index, entity } = getEntityDataFromNode(node, text, textIndex);

    if (entity) {
      textIndex = index;
      entities.push(entity);
    } else if (node.textContent) {
      // Skip newlines on the beginning
      if (index === 0 && node.textContent.trim() === "") {
        return;
      }
      textIndex += node.textContent.length;
    }

    if (node.hasChildNodes() && recursionDeepness <= MAX_TAG_DEEPNESS) {
      recursionDeepness += 1;
      Array.from(node.childNodes).forEach(addEntity);
    }
  }

  Array.from(fragment.childNodes).forEach((node) => {
    recursionDeepness = 1;
    addEntity(node);
  });

  return {
    text,
    entities: entities.length ? entities : undefined,
  };
}
function fixImageContent(fragment: HTMLDivElement) {
  fragment.querySelectorAll("img").forEach((node) => {
    if (node.dataset.documentId) {
      // Custom Emoji
      node.textContent = (node as HTMLImageElement).alt || "";
    } else {
      // Regular emoji with image fallback
      node.replaceWith(node.alt || "");
    }
  });
}

function getEntityDataFromNode(
  node: ChildNode,
  rawText: string,
  textIndex: number
): { index: number; entity?: ApiMessageEntity } {
  const type = getEntityTypeFromNode(node);

  if (!type || !node.textContent) {
    return {
      index: textIndex,
      entity: undefined,
    };
  }

  const rawIndex = rawText.indexOf(node.textContent, textIndex);
  // In some cases, last text entity ends with a newline (which gets trimmed from `rawText`).
  // In this case, `rawIndex` would return `-1`, so we use `textIndex` instead.
  const index = rawIndex >= 0 ? rawIndex : textIndex;
  const offset = rawText.substring(0, index).length;
  const { length } = rawText.substring(index, index + node.textContent.length);

  if (type === ApiMessageEntityTypes.TextUrl) {
    return {
      index,
      entity: {
        type,
        offset,
        length,
        url: (node as HTMLAnchorElement).href,
      },
    };
  }
  if (type === ApiMessageEntityTypes.MentionName) {
    return {
      index,
      entity: {
        type,
        offset,
        length,
        userId: (node as HTMLAnchorElement).dataset.userId!,
      },
    };
  }

  if (type === ApiMessageEntityTypes.Pre) {
    return {
      index,
      entity: {
        type,
        offset,
        length,
        language: (node as HTMLPreElement).dataset.language,
      },
    };
  }

  if (type === ApiMessageEntityTypes.CustomEmoji) {
    return {
      index,
      entity: {
        type,
        offset,
        length,
        documentId: (node as HTMLImageElement).dataset.documentId!,
      },
    };
  }

  if (type === ApiMessageEntityTypes.Timestamp) {
    const timestamp = Number((node as HTMLElement).dataset.timestamp);
    if (Number.isNaN(timestamp)) {
      return {
        index,
        entity: undefined,
      };
    }

    return {
      index,
      entity: {
        type,
        offset,
        length,
        timestamp,
      },
    };
  }

  return {
    index,
    entity: {
      type,
      offset,
      length,
    },
  };
}

export function getEntityTypeFromNode(
  node: ChildNode
): ApiMessageEntityTypes | undefined {
  if (node instanceof HTMLElement && node.dataset.entityType) {
    return node.dataset.entityType as ApiMessageEntityTypes;
  }

  if (ENTITY_CLASS_BY_NODE_NAME[node.nodeName]) {
    return ENTITY_CLASS_BY_NODE_NAME[node.nodeName];
  }

  if (node.nodeName === "A") {
    const anchor = node as HTMLAnchorElement;
    if (anchor.dataset.entityType === ApiMessageEntityTypes.MentionName) {
      return ApiMessageEntityTypes.MentionName;
    }
    if (anchor.dataset.entityType === ApiMessageEntityTypes.Url) {
      return ApiMessageEntityTypes.Url;
    }
    if (anchor.href.startsWith("mailto:")) {
      return ApiMessageEntityTypes.Email;
    }
    if (anchor.href.startsWith("tel:")) {
      return ApiMessageEntityTypes.Phone;
    }
    if (anchor.href !== anchor.textContent) {
      return ApiMessageEntityTypes.TextUrl;
    }

    return ApiMessageEntityTypes.Url;
  }

  if (node.nodeName === "SPAN") {
    return (node as HTMLElement).dataset.entityType as any;
  }

  if (node.nodeName === "IMG") {
    if ((node as HTMLImageElement).dataset.documentId) {
      return ApiMessageEntityTypes.CustomEmoji;
    }
  }

  return undefined;
}

export function escapeHtml(textParts: TextPart[]): TextPart[] {
  const divEl = document.createElement("div");
  return textParts.reduce((result: TextPart[], part) => {
    if (typeof part !== "string") {
      result.push(part);
      return result;
    }

    divEl.innerText = part;
    result.push(divEl.innerHTML);

    return result;
  }, []);
}

export type TextPart = HTMLElement | string | number | boolean | TextPart[];

function replaceEmojis(textParts: TextPart[]): TextPart[] {
  return textParts;
}

export type TextFilter =
  | "escape_html"
  | "hq_emoji"
  | "emoji"
  | "emoji_html"
  | "br"
  | "br_html"
  | "highlight"
  | "links"
  | "simple_markdown"
  | "simple_markdown_html"
  | "quote";
function compact<T extends any>(array: T[]) {
  return array.filter(Boolean);
}
export function renderText(
  part: TextPart,
  filters: Array<TextFilter> = ["emoji"],
  params?: {
    highlight?: string;
    quote?: string;
    markdownPostProcessor?: (part: string) => TextPart;
  }
): TextPart[] {
  if (typeof part !== "string") {
    return [part];
  }

  return compact(
    filters.reduce(
      (text, filter) => {
        switch (filter) {
          case "escape_html":
            return escapeHtml(text);

          case "hq_emoji":
            return replaceEmojis(text);

          case "emoji":
            return replaceEmojis(text);

          case "emoji_html":
            return replaceEmojis(text);

          case "br":
          case "br_html":
            return addLineBreaks(text);

          case "simple_markdown":
            return replaceSimpleMarkdown(text, params?.markdownPostProcessor);

          case "simple_markdown_html":
            return replaceSimpleMarkdown(text);
        }

        return text;
      },
      [part] as TextPart[]
    )
  );
}

interface IOrganizedEntity {
  entity: ApiMessageEntity;
  organizedIndexes: Set<number>;
  nestedEntities: IOrganizedEntity[];
}

function organizeEntity(
  entity: ApiMessageEntity,
  index: number,
  entities: ApiMessageEntity[],
  organizedEntityIndexes: Set<number>
): IOrganizedEntity | undefined {
  const { offset, length } = entity;
  const organizedIndexes = new Set([index]);

  if (organizedEntityIndexes.has(index)) {
    return undefined;
  }

  // Determine any nested entities inside current entity
  const nestedEntities: IOrganizedEntity[] = [];
  const parsedNestedEntities = entities
    .filter(
      (e, i) => i > index && e.offset >= offset && e.offset < offset + length
    )
    .map((e) =>
      organizeEntity(e, entities.indexOf(e), entities, organizedEntityIndexes)
    )
    .filter(Boolean);

  parsedNestedEntities.forEach((parsedEntity) => {
    let isChanged = false;

    parsedEntity!.organizedIndexes.forEach((organizedIndex) => {
      if (!isChanged && !organizedIndexes.has(organizedIndex)) {
        isChanged = true;
      }

      organizedIndexes.add(organizedIndex);
    });

    if (isChanged) {
      nestedEntities.push(parsedEntity!);
    }
  });

  return {
    entity,
    organizedIndexes,
    nestedEntities,
  };
}

// Organize entities in a tree-like structure to better represent how the text will be displayed
function organizeEntities(entities: ApiMessageEntity[]) {
  const organizedEntityIndexes: Set<number> = new Set();
  const organizedEntities: IOrganizedEntity[] = [];

  entities.forEach((entity, index) => {
    if (organizedEntityIndexes.has(index)) {
      return;
    }

    const organizedEntity = organizeEntity(
      entity,
      index,
      entities,
      organizedEntityIndexes
    );
    if (organizedEntity) {
      organizedEntity.organizedIndexes.forEach((organizedIndex) => {
        organizedEntityIndexes.add(organizedIndex);
      });

      organizedEntities.push(organizedEntity);
    }
  });

  return organizedEntities;
}

const SIMPLE_MARKDOWN_REGEX = /(\*\*|__).+?\1/g;

function addLineBreaks(textParts: TextPart[]): TextPart[] {
  return textParts.reduce((result: TextPart[], part) => {
    if (typeof part !== "string") {
      result.push(part);
      return result;
    }

    const splittenParts = part
      .split(/\r\n|\r|\n/g)
      .reduce((parts: TextPart[], line: string, i, source) => {
        // This adds non-breaking space if line was indented with spaces, to preserve the indentation
        const trimmedLine = line.trimLeft();
        const indentLength = line.length - trimmedLine.length;
        parts.push(String.fromCharCode(160).repeat(indentLength) + trimmedLine);

        if (i !== source.length - 1) {
          parts.push("<br />");
        }

        return parts;
      }, []);

    return [...result, ...splittenParts];
  }, []);
}

function replaceSimpleMarkdown(
  textParts: TextPart[],
  postProcessor?: (part: string) => TextPart
): TextPart[] {
  const postProcess = postProcessor || ((part: string) => part);

  return textParts.reduce<TextPart[]>((result, part) => {
    if (typeof part !== "string") {
      result.push(part);
      return result;
    }

    const parts = part.split(SIMPLE_MARKDOWN_REGEX);
    const entities: string[] = part.match(SIMPLE_MARKDOWN_REGEX) || [];
    result.push(postProcess(parts[0]));

    return entities.reduce((entityResult: TextPart[], entity, i) => {
      entityResult.push(
        entity.startsWith("**")
          ? `<b>${entity.replace(/\*\*/g, "")}</b>`
          : `<i>${entity.replace(/__/g, "")}</i>`
      );

      const index = i * 2 + 2;
      if (parts[index]) {
        entityResult.push(postProcess(parts[index]));
      }

      return entityResult;
    }, result);
  }, []);
}

type RenderTextParams = Parameters<typeof renderText>[2];

function renderMessagePart({
  content,
  highlight,
  focusedQuote,
  emojiSize,
  shouldRenderAsHtml,
  asPreview,
}: {
  content: TextPart | TextPart[];
  highlight?: string;
  focusedQuote?: string;
  emojiSize?: number;
  shouldRenderAsHtml?: boolean;
  asPreview?: boolean;
}) {
  if (Array.isArray(content)) {
    const result: TextPart[] = [];

    content.forEach((c) => {
      result.push(
        ...renderMessagePart({
          content: c,
          highlight,
          focusedQuote,
          emojiSize,
          shouldRenderAsHtml,
          asPreview,
        })
      );
    });

    return result;
  }

  if (shouldRenderAsHtml) {
    return renderText(content, ["escape_html", "emoji_html", "br_html"]);
  }

  const filters: TextFilter[] = ["emoji"];
  const params: RenderTextParams = {};
  if (!asPreview) {
    filters.push("br");
  }

  if (highlight) {
    filters.push("highlight");
    params.highlight = highlight;
  }
  if (focusedQuote) {
    filters.push("quote");
    params.quote = focusedQuote;
  }

  return renderText(content, filters, params);
}
export interface ApiFormattedText {
  text: string;
  entities?: ApiMessageEntity[];
}

export function getTextWithEntitiesAsHtml(formattedText?: ApiFormattedText) {
  const { text, entities } = formattedText || {};
  if (!text) {
    return "";
  }

  const result = renderTextWithEntities({
    text,
    entities,
    shouldRenderAsHtml: true,
  });

  if (Array.isArray(result)) {
    return result.join("");
  }

  return result;
}

export function renderTextWithEntities({
  text,
  entities,
  highlight,
  emojiSize,
  shouldRenderAsHtml,
  asPreview,
  focusedQuote,
}: {
  text: string;
  entities?: ApiMessageEntity[];
  highlight?: string;
  emojiSize?: number;
  shouldRenderAsHtml?: boolean;
  containerId?: string;
  asPreview?: boolean;
  isProtected?: boolean;
  withTranslucentThumbs?: boolean;
  cacheBuster?: string;
  forcePlayback?: boolean;
  noCustomEmojiPlayback?: boolean;
  focusedQuote?: string;
  isInSelectMode?: boolean;
  chatId?: string;
  messageId?: number;
  maxTimestamp?: number;
}) {
  if (!entities?.length) {
    return renderMessagePart({
      content: text,
      highlight,
      focusedQuote,
      emojiSize,
      shouldRenderAsHtml,
      asPreview,
    });
  }

  const result: TextPart[] = [];
  let deleteLineBreakAfterPre = false;

  const organizedEntities = organizeEntities(entities);

  // Recursive function to render regular and nested entities
  function renderEntity(
    textPartStart: number,
    textPartEnd: number,
    organizedEntity: IOrganizedEntity,
    isLastEntity: boolean
  ) {
    const renderResult: TextPart[] = [];
    const { entity, nestedEntities } = organizedEntity;
    const { offset, length, type } = entity;

    // Render text before the entity
    let textBefore = text.substring(textPartStart, offset);
    const textBeforeLength = textBefore.length;
    if (textBefore) {
      if (
        deleteLineBreakAfterPre &&
        textBefore.length > 0 &&
        textBefore[0] === "\n"
      ) {
        textBefore = textBefore.substr(1);
        deleteLineBreakAfterPre = false;
      }
      if (textBefore) {
        renderResult.push(
          ...(renderMessagePart({
            content: textBefore,
            highlight,
            focusedQuote,
            emojiSize,
            shouldRenderAsHtml,
            asPreview,
          }) as TextPart[])
        );
      }
    }

    const entityStartIndex = textPartStart + textBeforeLength;
    const entityEndIndex = entityStartIndex + length;

    let entityContent: TextPart = text.substring(offset, offset + length);
    const nestedEntityContent: TextPart[] = [];

    if (
      deleteLineBreakAfterPre &&
      entityContent.length > 0 &&
      entityContent[0] === "\n"
    ) {
      entityContent = entityContent.substr(1);
      deleteLineBreakAfterPre = false;
    }

    if (type === ApiMessageEntityTypes.Pre) {
      deleteLineBreakAfterPre = true;
    }

    // Render nested entities, if any
    if (nestedEntities.length) {
      let nestedIndex = entityStartIndex;

      nestedEntities.forEach((nestedEntity, nestedEntityIndex) => {
        const {
          renderResult: nestedResult,
          entityEndIndex: nestedEntityEndIndex,
        } = renderEntity(
          nestedIndex,
          entityEndIndex,
          nestedEntity,
          nestedEntityIndex === nestedEntities.length - 1
        );

        nestedEntityContent.push(...nestedResult);
        nestedIndex = nestedEntityEndIndex;
      });
    }

    // Render the entity itself
    const newEntity = processEntityAsHtml(
      entity,
      entityContent,
      nestedEntityContent
    );

    if (Array.isArray(newEntity)) {
      renderResult.push(...newEntity);
    } else {
      renderResult.push(newEntity);
    }

    // Render text after the entity, if it is the last entity in the text,
    // or the last nested entity inside of another entity
    if (isLastEntity && entityEndIndex < textPartEnd) {
      let textAfter = text.substring(entityEndIndex, textPartEnd);
      if (
        deleteLineBreakAfterPre &&
        textAfter.length > 0 &&
        textAfter[0] === "\n"
      ) {
        textAfter = textAfter.substring(1);
      }
      if (textAfter) {
        renderResult.push(
          ...(renderMessagePart({
            content: textAfter,
            highlight,
            focusedQuote,
            emojiSize,
            shouldRenderAsHtml,
            asPreview,
          }) as TextPart[])
        );
      }
    }

    return {
      renderResult,
      entityEndIndex,
    };
  }

  // Process highest-level entities
  let index = 0;

  organizedEntities.forEach((entity, arrayIndex) => {
    const { renderResult, entityEndIndex } = renderEntity(
      index,
      text.length,
      entity,
      arrayIndex === organizedEntities.length - 1
    );

    result.push(...renderResult);
    index = entityEndIndex;
  });

  return result;
}

export function processEntityAsHtml(
  entity: ApiMessageEntity,
  entityContent: TextPart,
  nestedEntityContent: TextPart[]
) {
  const rawEntityText =
    typeof entityContent === "string" ? entityContent : undefined;

  // Prevent adding newlines when editing
  const content =
    entity.type === ApiMessageEntityTypes.Pre
      ? (entityContent as string).trimEnd()
      : entityContent;

  const renderedContent = nestedEntityContent.length
    ? nestedEntityContent.join("")
    : renderText(content, ["escape_html", "emoji_html", "br_html"]).join("");

  if (!rawEntityText) {
    return renderedContent;
  }

  switch (entity.type) {
    case ApiMessageEntityTypes.Bold:
      return `<b>${renderedContent}</b>`;
    case ApiMessageEntityTypes.Italic:
      return `<i>${renderedContent}</i>`;
    case ApiMessageEntityTypes.Underline:
      return `<u>${renderedContent}</u>`;
    case ApiMessageEntityTypes.Code:
      return `<code class="text-entity-code">${renderedContent}</code>`;
    case ApiMessageEntityTypes.Strike:
      return `<del>${renderedContent}</del>`;
    case ApiMessageEntityTypes.MentionName:
      return `<a
          class="text-entity-link"
          data-entity-type="${ApiMessageEntityTypes.MentionName}"
          data-user-id="${entity.userId}"
          contenteditable="false"
          dir="auto"
        >${renderedContent}</a>`;
    case ApiMessageEntityTypes.Url:
    case ApiMessageEntityTypes.TextUrl:
      return `<a
          class="text-entity-link"
          href=${getLinkUrl(rawEntityText, entity)}
          data-entity-type="${entity.type}"
          dir="auto"
        >${renderedContent}</a>`;
    case ApiMessageEntityTypes.Spoiler:
      return `<span
          class="spoiler"
          data-entity-type="${ApiMessageEntityTypes.Spoiler}"
          >${renderedContent}</span>`;
    case ApiMessageEntityTypes.Blockquote:
      return `<blockquote
          class="blockquote"
          data-entity-type="${ApiMessageEntityTypes.Blockquote}"
          >${renderedContent}</blockquote>`;
    default:
      return renderedContent;
  }
}

function getLinkUrl(entityContent: string, entity: ApiMessageEntity) {
  const { type } = entity;
  return type === ApiMessageEntityTypes.TextUrl && entity.url
    ? entity.url
    : entityContent;
}
