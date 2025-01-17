import * as React from "react";

import { Meta, StoryFn } from "@storybook/react";

import CompareTableComponent from "../../view/compare/CompareTable";

import "../../view/results/resultsView.css";

export default {
  title: "Compare/Compare Table",
  component: CompareTableComponent,
} as Meta<typeof CompareTableComponent>;

const Template: StoryFn<typeof CompareTableComponent> = (args) => (
  <CompareTableComponent {...args} />
);

export const CompareTable = Template.bind({});
CompareTable.args = {
  comparison: {
    t: "setComparisons",
    stats: {
      fromQuery: {
        name: "Query built from user-controlled sources",
        status: "finished in 0 seconds",
        time: "8/16/2023, 3:08:37 PM",
      },
      toQuery: {
        name: "Query built from user-controlled sources",
        status: "finished in 2 seconds",
        time: "8/16/2023, 3:07:21 PM",
      },
    },
    columns: [
      { name: "a", kind: "e" },
      { name: "b", kind: "e" },
    ],
    commonResultSetNames: ["edges", "nodes", "subpaths", "#select"],
    currentResultSetName: "edges",
    rows: {
      from: [],
      to: [
        [
          {
            label: "url : String",
            url: {
              uri: "file:/home/runner/work/sql2o-example/sql2o-example/src/main/java/org/example/HelloController.java",
              startLine: 22,
              startColumn: 27,
              endLine: 22,
              endColumn: 57,
            },
          },
          {
            label: "url",
            url: {
              uri: "file:/home/runner/work/sql2o-example/sql2o-example/src/main/java/org/example/HelloController.java",
              startLine: 23,
              startColumn: 33,
              endLine: 23,
              endColumn: 35,
            },
          },
        ],
      ],
    },
    message: undefined,
    databaseUri: "file:///java",
  },
};
