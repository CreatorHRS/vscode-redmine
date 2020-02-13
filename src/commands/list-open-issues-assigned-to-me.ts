import { RedmineServer } from "../redmine/redmine-server";
import * as vscode from "vscode";
import { IssueController } from "../controllers/issue-controller";
import { ActionProperties } from "./action-properties";

export interface PickItem extends vscode.QuickPickItem {
  label: string;
  description: string;
  detail: string;
  fullIssue?: any;
  [key: string]: any;
}

export default async ({ server }: ActionProperties) => {
  let promise = server.getIssuesAssignedToMe();

  promise.then(
    issues => {
      vscode.window
        .showQuickPick<PickItem>(
          issues.issues.map(issue => {
            return {
              label: `[${issue.tracker.name}] (${issue.status.name}) ${issue.subject} by ${issue.author.name}`,
              description: issue.description
                .split("\n")
                .join(" ")
                .split("\r")
                .join(""),
              detail: `Issue #${issue.id} assigned to ${
                issue.assigned_to ? issue.assigned_to.name : "no one"
              }`,
              fullIssue: issue
            };
          })
        )
        .then(issue => {
          if (issue === undefined) return;

          let controller = new IssueController(issue.fullIssue, server);

          controller.listActions();
        });
    },
    error => {
      vscode.window.showErrorMessage(error);
    }
  );

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window
    },
    progress => {
      progress.report({
        message: `Waiting for response from ${server.options.url.host}...`
      });
      return promise;
    }
  );
};
