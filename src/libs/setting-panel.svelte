<script>
    import SettingItem from "./setting-item.svelte";
    import { showMessage } from "siyuan";
    import { onMount, onDestroy } from 'svelte';
    import { setWorkFlow } from '@/utils';
    import { todoWorkFlow } from "@/workflow/todo";
    export let allWorkFlow={todo:todoWorkFlow};
    export let option={
            todo: "todo"
        };
    onMount(() => {
        showMessage("Setting panel opened");
    });
    onDestroy(() => {
        showMessage("Setting panel closed");
    });
</script>

<!--
You can use this template to quickly create a setting panel,
with the same UI style in SiYuan
-->

<div class="config__tab-container">

    <SettingItem
        type="select"
        title="Select"
        text="This is a select"
        settingKey="Select"
        settingValue="todo"
        options={option}
        on:changed={(event) => {
            setWorkFlow(allWorkFlow[event.detail.value])
        }}
    />
</div>
