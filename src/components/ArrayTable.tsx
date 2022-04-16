import Vue, {
  DefineComponent,
  defineComponent,
  computed,
  PropType,
  ExtractPropTypes,
  FunctionalComponent,
  VNode,
  VueElement,
  ref,
  Component,
  provide,
  inject,
  watch,
  createVNode,
  VNodeTypes,
} from "vue";
import {
  Tabs,
  Badge,
  TabsProps,
  TabPaneProps,
  PaginationProps,
  Pagination,
  Space,
  SelectProps,
  Select,
  TableProps,
  ButtonProps,
  TableColumnProps,
  Table,
} from "ant-design-vue";
import {
  useField,
  useFieldSchema,
  RecursionField,
  ExpressionScope,
} from "@formily/vue";
import { model, markRaw } from "@formily/reactive";
import { ArrayField, GeneralField, FieldDisplayTypes } from "@formily/core";
import { Schema, SchemaKey } from "@formily/json-schema";
import { observer } from "@formily/reactive-vue";
import { isArr, isBool } from "@formily/shared";
import { AntdIconProps } from "@ant-design/icons-vue/lib/components/AntdIcon";
import { createContext } from "../hooks/context";
import { usePrefixCls } from "../hooks/usePrefixCls";

interface IArrayTablePaginationProps extends PaginationProps {
  dataSource?: any[];
  children?: (dataSource: any[], pagination: VNode) => VueElement;
}
interface IStatusSelectProps extends SelectProps {
  pageSize: number;
}

export interface IArrayBaseContext {
  props: IArrayBaseProps;
  field: ArrayField;
  schema: Schema;
}

export type Axis = "x" | "y" | "xy";

export type SortEvent = MouseEvent;

export type Offset = number | string;

export type SortStartHandler = (sort: SortStart, event: SortEvent) => void;

export interface SortStart {
  node: Element;
  index: number;
  collection: Offset;
  isKeySorting: boolean;
  nodes: HTMLElement[];
  helper: HTMLElement;
}
export interface SortOver {
  index: number;
  oldIndex: number;
  newIndex: number;
  collection: Offset;
  isKeySorting: boolean;
  nodes: HTMLElement[];
  helper: HTMLElement;
}

export interface SortEnd {
  oldIndex: number;
  newIndex: number;
  collection: Offset;
  isKeySorting: boolean;
  nodes: HTMLElement[];
}
export type SortMoveHandler = (event: SortEvent) => void;
export type SortEndHandler = (sort: SortEnd, event: SortEvent) => void;
export type SortOverHandler = (sort: SortOver, event: SortEvent) => void;

export type ContainerGetter = (
  element: Element
) => HTMLElement | Promise<HTMLElement>;

export interface Dimensions {
  width: number;
  height: number;
}

export type HelperContainerGetter = () => HTMLElement;

export interface SortableContainerProps {
  axis?: Axis;
  lockAxis?: Axis;
  helperClass?: string;
  transitionDuration?: number;
  keyboardSortingTransitionDuration?: number;
  keyCodes?: {
    lift?: number[];
    drop?: number[];
    cancel?: number[];
    up?: number[];
    down?: number[];
  };
  pressDelay?: number;
  pressThreshold?: number;
  distance?: number;
  shouldCancelStart?: (event: SortEvent) => boolean;
  updateBeforeSortStart?: SortStartHandler;
  onSortStart?: SortStartHandler;
  onSortMove?: SortMoveHandler;
  onSortEnd?: SortEndHandler;
  onSortOver?: SortOverHandler;
  useDragHandle?: boolean;
  useWindowAsScrollContainer?: boolean;
  hideSortableGhost?: boolean;
  lockToContainerEdges?: boolean;
  lockOffset?: Offset | [Offset, Offset];
  getContainer?: ContainerGetter;
  getHelperDimensions?: (sort: SortStart) => Dimensions;
  helperContainer?: HTMLElement | HelperContainerGetter;
}

export interface IArrayBaseProps {
  disabled?: boolean;
  onAdd?: (index: number) => void;
  onRemove?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onMoveUp?: (index: number) => void;
}

export type ArrayBaseMixins = {
  Addition?: IArrayBaseAdditionProps;
  Remove?: AntdIconProps & { index?: number };
  MoveUp?: AntdIconProps & { index?: number };
  MoveDown?: AntdIconProps & { index?: number };
  SortHandle?: AntdIconProps & { index?: number };
  Index?: number;
  useArray?: () => IArrayBaseContext;
  useIndex?: (index?: number) => number;
  useRecord?: (record?: number) => any;
};

export interface IArrayBaseItemProps {
  index: number;
  record: any;
}

interface IArrayBaseAdditionProps extends ButtonProps {
  title?: string;
  method?: "push" | "unshift";
  defaultValue?: any;
}

type ComposedArrayTable = TableProps & ArrayBaseMixins & TableColumnProps;

type ComposedArrayBase = IArrayBaseProps &
  ArrayBaseMixins & {
    Item?: IArrayBaseItemProps;
    mixin?: <T extends Component>(target: T) => T & ArrayBaseMixins;
  };

interface ObservableColumnSource {
  field: GeneralField;
  columnProps: TableColumnProps<any>;
  schema: Schema;
  display: FieldDisplayTypes;
  name: string;
}

const iArrayTablePaginationProps = {
  pagination: {
    type: Object as PropType<IArrayTablePaginationProps>,
  },
};

type Node = typeof createVNode;

export function SortableContainer(
  wrappedComponent: any,
  config?: {
    withRef: boolean;
  }
): DefineComponent<SortableContainerProps>;

const SortableBody = (props: any) => <tbody {...props} />;

const SortableRow = (props: any) => <tr {...props} />;

const statusSelectProps = {
  selectProps: {
    type: Object as PropType<IStatusSelectProps>,
  },
};

const arrayTableProps = {
  tableProps: {
    type: Object as PropType<ComposedArrayTable>,
    default: {},
  },
};

const schedulerRequest = {
  request: null,
};

const ArrayBaseContext = createContext<IArrayBaseContext>(null);
const ItemContext = createContext<IArrayBaseItemProps>(null);

export const ArrayBase: ComposedArrayBase = (props: any, { slots }: any) => {
  const field = useField<ArrayField>();
  const schema = useFieldSchema();
  return (
    <ArrayBaseContext.Provider
      value={{ field: field.value, schema: schema.value, props }}
    >
      {slots?.default?.()}
    </ArrayBaseContext.Provider>
  );
};

ArrayBase.Item = (props: any, { slots }: any) => {
  return (
    <ItemContext.Provider value={props}>
      <ExpressionScope value={{ $record: props.record, $index: props.index }}>
        {slots?.default?.()}
      </ExpressionScope>
    </ItemContext.Provider>
  );
};

const StatusSelect = observer(
  defineComponent({
    props: statusSelectProps,
    setup({ selectProps }) {
      const field = useField<ArrayField>();
      const errors = field.value.errors;
      const parseIndex = (address: string) => {
        return Number(
          address
            .slice(address.indexOf(field.value.address.toString()) + 1)
            .match(/(\d+)/)?.[1]
        );
      };
      const options = selectProps?.options?.map(({ label, value }: any) => {
        const hasError = errors.some(({ address }: any) => {
          const currentIndex = parseIndex(address);
          const startIndex = (value - 1) * selectProps?.pageSize;
          const endIndex = value * selectProps?.pageSize;
          return currentIndex >= startIndex && currentIndex <= endIndex;
        });
        return {
          label: hasError ? <Badge dot>{label}</Badge> : label,
          value,
        };
      });

      const width = String(options?.length).length * 15;
      return (
        <Select
          value={selectProps?.value}
          onChange={selectProps?.onChange}
          options={options}
          virtual
          style={{
            width: width < 60 ? 60 : width,
          }}
        />
      );
    },
  }),
  {
    scheduler: (update) => {
      clearTimeout(schedulerRequest?.request as any);
      schedulerRequest.request = setTimeout(() => {
        update();
      }, 100) as any;
    },
  }
);

const ArrayTablePagination = defineComponent({
  props: iArrayTablePaginationProps,
  setup({ pagination }, { slots }) {
    const current = ref<number>(1);
    const pageSize = pagination?.pageSize || 10;
    const size = pagination?.size || "default";
    const dataSource = pagination?.dataSource || [];
    const startIndex = (current.value - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;
    const total = dataSource?.length || 0;
    const totalPage = Math.ceil(total / pageSize);
    const pages = Array.from(new Array(totalPage)).map((_, index) => {
      const page = index + 1;
      return {
        label: page,
        value: page,
      };
    });
    watch([totalPage, current], () => {
      if (totalPage > 0 && totalPage < current.value) {
        current.value = totalPage;
      }
    });
    const renderPagination = () => {
      if (totalPage <= 1) return;
      return (
        <div>
          <Space>
            <StatusSelect
              selectProps={{
                value: current,
                pageSize: pageSize,
                onChange: (val: any) => {
                  current.value = val;
                },
                options: pages,
                notFoundContent: false,
              }}
            />
            <Pagination
              {...pagination}
              pageSize={pageSize}
              current={current.value}
              total={dataSource.length}
              size={size}
              showSizeChanger={false}
              onChange={(val: any) => {
                current.value = val;
              }}
            />
          </Space>
        </div>
      );
    };
    return () => {
      return (
        <>
          {slots?.default?.(
            dataSource?.slice(startIndex, endIndex + 1),
            renderPagination()
          )}
        </>
      );
    };
  },
});

const isColumnComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Column") > -1;
};

const isOperationsComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Operations") > -1;
};

const isAdditionComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Addition") > -1;
};

const useAddition = () => {
  const schema = useFieldSchema();
  return schema.value.reduceProperties((addition, schema, key) => {
    if (isAdditionComponent(schema)) {
      return <RecursionField schema={schema} name={key} />;
    }
    return addition;
  }, null);
};

const useArrayTableSources = () => {
  const fields = useField();
  const fieldSchema = useFieldSchema();
  const arrayField = fields.value;
  const schema = fieldSchema.value;
  const parseSources = (schema: Schema): any => {
    if (
      isColumnComponent(schema) ||
      isOperationsComponent(schema) ||
      isAdditionComponent(schema)
    ) {
      if (!schema["x-component-props"]?.["dataIndex"] && !schema["name"])
        return [];
      const name = schema["x-component-props"]?.["dataIndex"] || schema["name"];
      const field: any = arrayField
        .query(arrayField.address.concat(name))
        .take();
      const columnProps =
        field?.component?.[1] || schema["x-component-props"] || {};
      const display = field?.display || schema["x-display"];
      return [
        {
          name,
          display,
          field,
          schema,
          columnProps,
        },
      ];
    } else if (schema.properties) {
      return schema.reduceProperties((buf, schema) => {
        return buf.concat(parseSources(schema) as any);
      }, []);
    }
  };
  const parseArrayItems = (schema: Schema["items"]) => {
    if (!schema) return [];
    const sources: ObservableColumnSource[] = [];
    const items = isArr(schema) ? schema : [schema];
    return items.reduce((columns, schema) => {
      const item = parseSources(schema);
      if (item) {
        return columns.concat(item);
      }
      return columns;
    }, sources);
  };

  if (!schema) throw new Error("can not found schema object");

  return parseArrayItems(schema.items);
};

const useArrayTableColumns = (
  dataSource: any[],
  sources: ObservableColumnSource[]
): TableProps<any>["columns"] => {
  return sources.reduce(
    (buf: any, { name, columnProps, schema, display }, key) => {
      if (display !== "visible") return buf;
      if (!isColumnComponent(schema)) return buf;
      return buf.concat({
        ...columnProps,
        key,
        dataIndex: name,
        render: (value: any, record: any) => {
          const index = dataSource.indexOf(record);
          const children = (
            <ArrayBase.Item index={index} record={record}>
              <RecursionField
                schema={schema}
                name={index}
                onlyRenderProperties
              />
            </ArrayBase.Item>
          );
          return children;
        },
      });
    },
    []
  );
};

const RowComp = (props: any) => {
  return <SortableRow index={props["data-row-key"] || 0} {...props} />;
};

const ArrayTable = defineComponent({
  props: arrayTableProps,
  setup({ tableProps }) {
    const { ...props } = tableProps;
    const refDiv = ref<HTMLDivElement>();
    const prefixCls = usePrefixCls("formily-array-table");
    const field = useField<ArrayField>();
    const dataSource = Array.isArray(field.value.value)
      ? field.value.value.slice()
      : [];
    const sources = useArrayTableSources();
    const columns = useArrayTableColumns(dataSource, sources);
    const pagination = isBool(props.pagination) ? {} : props.pagination;
    const addition = useAddition();
    const defaultRowKey = (record: any) => {
      return dataSource.indexOf(record);
    };
    const addTdStyles = (node: HTMLElement) => {
      const helper = document.body.querySelector(`.${prefixCls}-sort-helper`);
      if (helper) {
        const tds = node.querySelectorAll("td");
        requestAnimationFrame(() => {
          helper.querySelectorAll("td").forEach((td, index) => {
            if (tds[index]) {
              td.style.width = getComputedStyle(tds[index]).width;
            }
          });
        });
      }
    };
    return () => {
      return (
        <ArrayTablePagination {...{ ...pagination, dataSource }}>
          {(dataSource, pager) => (
            <div ref={refDiv} class={prefixCls}>
              <ArrayBase>
                <Table
                  size="small"
                  bordered
                  rowKey={defaultRowKey}
                  {...props}
                  onChange={() => {}}
                  pagination={false}
                  columns={columns}
                  dataSource={dataSource}
                  components={{
                    body: {
                      wrapper: (props: any) => (
                        <SortableBody
                          useDragHandle
                          lockAxis="y"
                          helperClass={`${prefixCls}-sort-helper`}
                          helperContainer={() => {
                            return refDiv.value?.querySelector("tbody");
                          }}
                          onSortStart={({ node }) => {
                            addTdStyles(node);
                          }}
                          onSortEnd={({ oldIndex, newIndex }) => {
                            field.move(oldIndex, newIndex);
                          }}
                          {...props}
                        />
                      ),
                      row: RowComp,
                    },
                  }}
                />
                <div style={{ marginTop: 5, marginBottom: 5 }}>{pager}</div>
                {sources.map((column, key) => {
                  //专门用来承接对Column的状态管理
                  if (!isColumnComponent(column.schema)) return;
                  return (
                    <RecursionField
                      name={column.name}
                      schema={column.schema}
                      onlyRenderSelf={true}
                      key={key}
                    />
                  );
                })}
                {addition}
              </ArrayBase>
            </div>
          )}
        </ArrayTablePagination>
      );
    };
  },
});

ArrayTable.Column = () => {
  return <> </>;
};

ArrayBase.mixin = (target: any) => {
  target.Index = ArrayBase.Index;
  target.SortHandle = ArrayBase.SortHandle;
  target.Addition = ArrayBase.Addition;
  target.Remove = ArrayBase.Remove;
  target.MoveDown = ArrayBase.MoveDown;
  target.MoveUp = ArrayBase.MoveUp;
  target.useArray = ArrayBase.useArray;
  target.useIndex = ArrayBase.useIndex;
  target.useRecord = ArrayBase.useRecord;
  return target;
};

ArrayBase.mixin(ArrayTable);

export default ArrayTable;
