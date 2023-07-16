<script lang="ts">
    import { sql } from "@/api";
    import { Grouper, WorkFlow, WorkFlowApi } from "@/types/index.d.ts";
    import Block  from "./block.svelte"

    import { workflowApi } from "@/workflowApi";
    import { keys } from "ramda";

    export let workFlow: WorkFlow;
    async function getGrouped(
        searcher: string,
        grouper: Grouper,
        api: WorkFlowApi
    ) {
        let blockList = await sql(searcher);
        let grouped = grouper(blockList, api);
        console.log(grouped)
        return grouped;
    }
    let groupedPromise = getGrouped(
        workFlow.searcher,
        workFlow.grouper,
        workflowApi
    );
    function click(){
        groupedPromise = getGrouped(
        workFlow.searcher,
        workFlow.grouper,
        workflowApi
    );
    }
</script>

<div id="sevlte">
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconEmoji"></use></svg>
            Custom Dock
        </div>
        <span class="fn__flex-1 fn__space"></span>
        <span class="block__icon b3-tooltips b3-tooltips__sw" aria-label="刷新" on:click={click}><svg class=""><use xlink:href="#iconRefresh"></use></svg></span>
        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min Ctrl+W"><svg><use xlink:href="#iconMin"></use></svg></span>
    </div>
    {#await groupedPromise}
        <p>loading...</p>
    {:then grouped}
        {#each Object.keys(grouped) as groupKey}
            <p>{groupKey}</p>
            <Block workflowType={groupKey} blockList={grouped[groupKey]} />
        {/each}
    {/await}
</div>

