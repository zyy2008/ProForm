import {
  defineComponent,
  computed,
  PropType,
  ExtractPropTypes,
  FunctionalComponent,
} from "vue";
import { Tabs, Badge, TabsProps, TabPaneProps } from "ant-design-vue";
import { useField, useFieldSchema, RecursionField } from "@formily/vue";
import { model, markRaw } from "@formily/reactive";
import { Schema, SchemaKey } from "@formily/json-schema";
export interface IFormTab {
  activeKey: string;
  setActiveKey(key: string): void;
}

export interface IFormTabProps extends TabsProps {
  formTab?: IFormTab;
}
export interface IFormTabPaneProps extends TabPaneProps {
  key: string | number;
}

const createFormTab = (defaultActiveKey?: string) => {
  const formTab = model({
    activeKey: defaultActiveKey,
    setActiveKey(key: string) {
      formTab.activeKey = key;
    },
  });
  return markRaw(formTab);
};

const formTabProps = {
  tabPane: {
    type: Object as PropType<IFormTabPaneProps>,
  },
  createFormTab: {
    type: Function as PropType<(defaultActiveKey?: string) => IFormTab>,
  },
  formTab: {
    type: Object as PropType<IFormTab>,
  },
  activeKey: {
    type: String,
  },
  tab: {
    type: Object as PropType<IFormTabProps>,
  },
};

export type FormTabProps = Partial<ExtractPropTypes<typeof formTabProps>>;

const useTabs = () => {
  const tabsField = useField();
  const schema = useFieldSchema();
  const tabs: { name: SchemaKey; props: any; schema: Schema }[] = [];
  schema?.value.mapProperties((schema, name) => {
    const field = tabsField.value
      .query(tabsField.value.address.concat(name))
      .take();
    if (field?.display === "none" || field?.display === "hidden") return;
    if (schema["x-component"]?.indexOf("TabPane") > -1) {
      tabs.push({
        name,
        props: {
          key: schema?.["x-component-props"]?.key || name,
          ...schema?.["x-component-props"],
        },
        schema,
      });
    }
  });
  return tabs;
};

const FormTab = defineComponent({
  props: formTabProps,
  setup({ formTab }) {
    const field = useField();
    const tabs = useTabs();
    const _formTab = computed(() => {
      return formTab ? formTab : createFormTab();
    });
    const badgedTab = (key: SchemaKey, props: any) => {
      const errors = field.value.form.queryFeedbacks({
        type: "error",
        address: `${field.value.address.concat(key)}.*`,
      });
      if (errors.length) {
        return (
          <Badge size="small" class="errors-badge" count={errors.length}>
            {props.tab}
          </Badge>
        );
      }
      return props.tab;
    };
    return (props: FormTabProps) => {
      const { tab } = props;
      const activeKey = props.activeKey || _formTab.value?.activeKey;
      return (
        <Tabs
          {...tab}
          activeKey={activeKey}
          onChange={(key: any) => {
            tab?.onChange?.(key);
            formTab?.setActiveKey?.(key);
          }}
        >
          {tabs.map(({ props, schema, name }, key) => (
            <Tabs.TabPane
              key={key}
              {...props}
              tab={badgedTab(name, props)}
              forceRender
            >
              <RecursionField schema={schema} name={name} />
            </Tabs.TabPane>
          ))}
        </Tabs>
      );
    };
  },
});

const TabPane: FunctionalComponent<IFormTabPaneProps> = (_, { slots }) => {
  return <>{slots?.default?.()}</>;
};

FormTab.TabPane = TabPane;
FormTab.createFormTab = createFormTab;

export default FormTab;
