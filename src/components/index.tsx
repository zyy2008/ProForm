import { defineComponent, ref } from "vue";
import { Tabs, Badge } from "ant-design-vue";
import { ArrayField } from "@formily/core";
import { useField, useFieldSchema, RecursionField } from "@formily/vue";

const ArrayTabs = defineComponent({
  setup() {
    const activeKey = ref<string>("tab-0");
    const field = useField<ArrayField>();
    const schema = useFieldSchema();
    const value = Array.isArray(field.value.value) ? field.value.value : [];
    return (props: any) => {
      const dataSource = value?.length ? value : [{}];
      return (
        <Tabs
          {...props}
          activeKey={activeKey.value}
          onChange={(key) => {
            activeKey.value = key as string;
          }}
          type="editable-card"
          onEdit={(targetKey: any, type: "add" | "remove") => {
            if (type == "add") {
              const id = dataSource.length;
              if (field?.value?.value.length) {
                field.value.push(null);
              } else {
                field.value.push(null, null);
              }
              activeKey.value = `tab-${id}`;
            } else if (type == "remove") {
              const index = Number(targetKey.match(/-(\d+)/)?.[1]);
              if (index - 1 > -1) {
                activeKey.value = `tab-${index - 1}`;
              }
              field.value.remove(index);
            }
          }}
        >
          {dataSource?.map((_, index) => {
            console.log(schema.value);
            const items = Array.isArray(schema.value.items)
              ? schema.value.items[index]
              : schema.value.items;
            const key = `tab-${index}`;
            return (
              <Tabs.TabPane
                key={key}
                forceRender
                closable={index !== 0}
                tab={() => {
                  const tab = `${field.value.title || "Untitled"} ${index + 1}`;
                  const errors = field.value.errors.filter((error) =>
                    error?.address?.includes(`${field.value.address}.${index}`)
                  );
                  if (errors.length) {
                    return (
                      <Badge
                        size="small"
                        class="errors-badge"
                        count={errors.length}
                      >
                        {tab}
                      </Badge>
                    );
                  }
                  return tab;
                }}
              >
                <RecursionField schema={items} name={index} />
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      );
    };
  },
});
export default ArrayTabs;
