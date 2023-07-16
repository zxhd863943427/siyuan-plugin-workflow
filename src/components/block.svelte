<script lang="ts">
    import { Block } from "@/types/index.d.ts";
    import {Protyle} from "siyuan"
    import {app} from "@/utils"
    import {onMount} from "svelte"
    export let workflowType:string;
    export let blockList:Block[];
    onMount(()=>{
        for(let block of blockList){
        new Protyle(app,document.querySelector(`#${"workflow"+block.id}`), {
            blockId: block.id,
            render: {
        gutter: true
    }
        })
    }
    })

    export let isExpanded: boolean = true;

let liElement: HTMLElement;

export function toggleExpand(expand?: boolean) {
    isExpanded = expand === undefined ? !isExpanded : expand;
}

let liSvgClass = "b3-list-item__arrow";
let ulClass = "fn__none";
let titleStyle = "";
$: {
    if (isExpanded) {
        liSvgClass = "b3-list-item__arrow b3-list-item__arrow--open";
        ulClass = "";
    } else {
        liSvgClass = "b3-list-item__arrow";
        ulClass = "fn__none";
    }
}

    
</script>

<li
    class="b3-list-item b3-list-item--hide-action workflow-title"
    data-treetype="bookmark"
    data-type="undefined"
    data-subtype="undefined"
    bind:this={liElement}
    on:click={() => toggleExpand()}
    on:keydown={() => {}}
>
    <span
        style="padding-left: 4px;margin-right: 2px"
        class="b3-list-item__toggle b3-list-item__toggle--hl"
    >
        <svg data-id="Doing0" class={liSvgClass}
            ><use xlink:href="#iconRight" /></svg
        >
    </span>
    <span>{workflowType}</span>
    <!-- <span
        class="b3-list-item__action b3-tooltips b3-tooltips__w"
        aria-label={i18n.DockReserve.PopupResv}
        on:click={(event) => clickListMore(event)}
        on:keydown={() => {}}
    >
        <svg><use xlink:href="#iconMore" /></svg>
    </span> -->
    <!-- <span
        class="counter b3-list-item__action b3-tooltips b3-tooltips__w"
        on:keydown={() => {}}
    >
    </span> -->
</li>

<div class={ulClass}>
    {#each blockList as block}
    <div id={"workflow"+block.id}></div>
    {/each}
</div>
