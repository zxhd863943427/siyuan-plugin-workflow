/**
 * Copyright (c) 2023 frostime. All rights reserved.
 */

import { Protyle,Plugin } from "siyuan";
import siyuan from "siyuan";
/**
 * Frequently used data structures in SiYuan
 */
type DocumentId = string;
type BlockId = string;
type NotebookId = string;
type PreviousID = BlockId;
type ParentID = BlockId | DocumentId;

type Notebook = {
    id: NotebookId;
    name: string;
    icon: string;
    sort: number;
    closed: boolean;
}

type NotebookConf = {
    name: string;
    closed: boolean;
    refCreateSavePath: string;
    createDocNameTemplate: string;
    dailyNoteSavePath: string;
    dailyNoteTemplatePath: string;
}

type BlockType = "d" | "s" | "h" | "t" | "i" | "p" | "f" | "audio" | "video" | "other";

type BlockSubType = "d1" | "d2" | "s1" | "s2" | "s3" | "t1" | "t2" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "table" | "task" | "toggle" | "latex" | "quote" | "html" | "code" | "footnote" | "cite" | "collection" | "bookmark" | "attachment" | "comment" | "mindmap" | "spreadsheet" | "calendar" | "image" | "audio" | "video" | "other";

type Block = {
    id: BlockId;
    parent_id?: BlockId;
    root_id: DocumentId;
    hash: string;
    box: string;
    path: string;
    hpath: string;
    name: string;
    alias: string;
    memo: string;
    tag: string;
    content: string;
    fcontent?: string;
    markdown: string;
    length: number;
    type: BlockType;
    subtype: BlockSubType;
    ial?: string;
    sort: number;
    created: string;
    updated: string;
}

type doOperation = {
    action: string;
    data: string;
    id: BlockId;
    parentID: BlockId | DocumentId;
    previousID: BlockId;
    retData: null;
}

type Searcher = string

interface Watcher {
    (wsDetail:any,api:WorkFlowApi): number;
}
interface Grouper {
    (blockList:Array<Block>,api:WorkFlowApi):Partial<Record<any, Block[]>>
}

interface Initer {
    (searcher:Searcher,api:WorkFlowApi)
}

type Switcher = {
    filter: string[],
    html: string
    id: string
    callback(protyle: Protyle): void
}[]

type WorkFlow ={
    watcher:Watcher,
    operator:Array<Function>,
    searcher:Searcher,
    grouper:Grouper,
    initer:Initer,
    switcherList:Switcher
}

type WorkFlowApi = { sql:Function, 
    getBlockAttrs:Function,
    setBlockAttrs:Function,
    newNodeID:()=>string }

interface IProtyle {
    getInstance: () => import("../protyle").Protyle,
    app: import("../index").App,
    transactionTime: number,
    id: string,
    block: {
        id?: string,
        scroll?: boolean
        parentID?: string,
        parent2ID?: string,
        rootID?: string,
        showAll?: boolean
        mode?: number
        blockCount?: number
        action?: string[]
    },
    disabled: boolean,
    selectElement?: HTMLElement,
    ws?: import("../layout/Model").Model,
    notebookId?: string
    path?: string
    model?: import("../../src/editor").Editor,
    updated: boolean;
    element: HTMLElement;
    scroll?: import("../protyle/scroll").Scroll,
    gutter?: import("../protyle/gutter").Gutter,
    breadcrumb?: import("../protyle/breadcrumb").Breadcrumb,
    title?: import("../protyle/header/Title").Title,
    background?: import("../protyle/header/background").Background,
    contentElement?: HTMLElement,
    options: IOptions;
    lute?: Lute;
    toolbar?: import("../protyle/toolbar").Toolbar,
    preview?: import("../protyle/preview").Preview;
    hint?: import("../protyle/hint").Hint;
    upload?: import("../protyle/upload").Upload;
    undo?: import("../protyle/undo").Undo;
    wysiwyg?: import("../protyle/wysiwyg").WYSIWYG
}