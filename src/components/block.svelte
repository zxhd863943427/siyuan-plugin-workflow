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
            render:{
                background: false,
                title: false,
                gutter: false,
                scroll: false,
                breadcrumb: true,
                breadcrumbDocName: false,
                    }
        })
    }
    })

    
</script>

{#each blockList as block}
    <div id={"workflow"+block.id}></div>
{/each}