<script lang="ts">
    import { sql } from "@/api";
    import { Grouper, WorkFlow, WorkFlowApi } from "@/types/index.d.ts";
    import Block from "./block.svelte";

    import { workflowApi } from "@/workflowApi";
    import {status} from "@/workflow/utils"

    export let workFlow: WorkFlow;
    let _status:number;
    async function getGrouped(
        searcher: string,
        grouper: Grouper,
        api: WorkFlowApi
    ) {
        let blockList = await sql(searcher);
        let grouped = grouper(blockList, api);
        // console.log(grouped);
        return grouped;
    }
    let groupedPromise = getGrouped(
        workFlow.searcher,
        workFlow.grouper,
        workflowApi
    );
    function update() {
        groupedPromise = getGrouped(
            workFlow.searcher,
            workFlow.grouper,
            workflowApi
        );
    }
    function getWorkFlowGroupKeyList(grouped){
        return workFlow.workFlowOrder? workFlow.workFlowOrder:Object.keys(grouped)
    }
    status.subscribe(value => {
        _status = value;
        update()
    });
</script>

<div id="sevlte">
    <div class="block__icons">
        <div class="block__logo">
            <svg><use xlink:href="#iconHistory" /></svg>
            workflow
        </div>
        <span class="fn__flex-1 fn__space" />
        <button
            class="block__icon b3-tooltips b3-tooltips__sw"
            aria-label="刷新"
            on:click={update}
            ><svg class=""><use xlink:href="#iconRefresh" /></svg></button
        >
        <span
            data-type="min"
            class="block__icon b3-tooltips b3-tooltips__sw"
            aria-label="Min Ctrl+W"
            ><svg><use xlink:href="#iconMin" /></svg></span
        >
    </div>
    {#await groupedPromise}
        <p>loading...</p>
    {:then grouped}
        {#each getWorkFlowGroupKeyList(grouped) as groupKey}
            <Block workflowType={groupKey} blockList={grouped[groupKey] ? grouped[groupKey] : []} />
        {/each}
    {/await}
</div>
