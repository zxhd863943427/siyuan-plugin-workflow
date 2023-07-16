<script>
    import SettingItem from "./setting-item.svelte";
    import { setWorkFlow } from '@/utils';
    import { todoWorkFlow } from "@/workflow/todo";
    export let allWorkFlow={todo:todoWorkFlow};
    export let option={
            todo: "todo"
        };
</script>

<!--
You can use this template to quickly create a setting panel,
with the same UI style in SiYuan
-->

<div class="config__tab-container">

    <SettingItem
        type="select"
        title="工作流"
        text="选中当前使用的工作流"
        settingKey="Select"
        settingValue="todo"
        options={option}
        on:changed={(event) => {
            setWorkFlow(allWorkFlow[event.detail.value])
        }}
    />
</div>
