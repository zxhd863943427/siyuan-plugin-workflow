export function getParentElementById(dataId:string):Element|null{
    // let currentPage = getCurrentPage()
    let sourceElement = document.querySelector(`[data-node-id][data-type]:has(>div[data-node-id="${dataId}"][data-type])`)
    return sourceElement
}

export function getElementById(dataId:string):Element|null{
    // let currentPage = getCurrentPage()
    let sourceElement = document.querySelector(`div[data-node-id="${dataId}"][data-type]`)
    return sourceElement
}

export function getDataNodeId(item:any):string|null{
    if (item.data === null || (typeof(item.data)) != "string") {
        return null
    }
    // let element = document.createElement("div")
    // element.innerHTML = item.data
    // let dataId = (element.childNodes[0] as HTMLElement).getAttribute("data-node-id")
    let dataIDRegx = /data-node-id\s?=\s?"(\d{14}-.{7})"/
    let match = dataIDRegx.exec(item.data)
    let dataId;
    if (match == null){
        return null
    }
    dataId = match[1]
    return dataId
}