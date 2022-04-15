import { defineComponent, reactive, ref } from "vue";
import { Form, Button, Input, Select, Tabs, FormItem } from "ant-design-vue";
import { createForm } from "@formily/core";
import { FormProvider, Field, createSchemaField } from "@formily/vue";
import ArrayTabs from "./components/index";

const { SchemaField } = createSchemaField({
  components: {
    Input,
    FormItem,
    ArrayTabs,
  },
});
const form = createForm();

export default defineComponent({
  setup() {
    return () => (
      // <Form>
      //   <Form.Item>
      //     <Button htmlType="submit">提交</Button>
      //   </Form.Item>
      // </Form>
      <FormProvider form={form}>
        <Form
          onFinish={(val) => {
            console.log(val);
          }}
        >
          <SchemaField
            schema={{
              type: "object",
              properties: {
                array: {
                  type: "array",
                  title: "对象数组",
                  "x-decorator": "FormItem",
                  maxItems: 3,
                  "x-component": "ArrayTabs",
                  items: {
                    type: "object",
                    properties: {
                      aaa: {
                        type: "string",
                        "x-decorator": "FormItem",
                        title: "AAA",
                        required: true,
                        "x-component": "Input",
                      },
                      bbb: {
                        type: "string",
                        "x-decorator": "FormItem",
                        title: "BBB",
                        required: true,
                        "x-component": "Input",
                      },
                    },
                  },
                },
              },
            }}
          />
          <Button
            onClick={() => {
              form
                .submit()
                .then(() => {})
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
