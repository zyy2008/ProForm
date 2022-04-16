import Vue, {
  defineComponent,
  reactive,
  ref,
  Component,
  ComponentPropsOptions,
} from "vue";
import {
  Form,
  Button,
  Input,
  Select,
  Tabs,
  FormItemProps,
} from "ant-design-vue";
import { createForm, Field, GeneralField } from "@formily/core";
import {
  FormProvider,
  connect,
  createSchemaField,
  mapProps,
} from "@formily/vue";
import FormTab from "./components/index";
import ArrayTable from "./components/ArrayTable";

const FormItem = connect(
  Form.Item,
  mapProps<any>(
    {
      title: "label",
      description: "extra",
      required: true,
      validateStatus: true,
    },
    (props, field: any) => {
      return {
        ...props,
        help: field.selfErrors?.length ? field.selfErrors : undefined,
      };
    }
  )
);

const { SchemaField } = createSchemaField({
  components: {
    Input,
    FormItem,
    FormTab,
    ArrayTable,
  },
});
const form = createForm();
const formTab = FormTab.createFormTab();

const schema = {
  type: "object",
  properties: {
    array: {
      type: "array",
      "x-decorator": "FormItem",
      "x-component": "ArrayTable",
      "x-component-props": {
        pagination: { pageSize: 10 },
        scroll: { x: "100%" },
      },
      items: {
        type: "object",
        properties: {
          column3: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": { width: 100, title: "显隐->A2" },
            properties: {
              a1: {
                type: "boolean",
                "x-decorator": "FormItem",
                "x-component": "Switch",
              },
            },
          },
        },
      },
      properties: {
        add: {
          type: "void",
          "x-component": "ArrayTable.Addition",
          title: "添加条目",
        },
      },
    },
  },
};

export default defineComponent({
  setup() {
    return () => (
      <FormProvider form={form}>
        <Form>
          <Form.Item
            label={"123"}
            name="name"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input></Input>
          </Form.Item>
          <Button
            onClick={() => {
              form
                .submit()
                .then((val) => {
                  console.log(val);
                })
                .catch(() => {
                  return;
                });
            }}
          >
            提交
          </Button>
        </Form>
      </FormProvider>
    );
  },
});
