import cn from "classnames";
import { ActionList, ActionListView } from "./action-list-view";
import { tokens } from "./tokens";

type Element = React.ReactNode | JSX.Element;

interface ResourceHeaderProps {
  title: Element;
  description?: Element;
  actions?: ActionList;
  filterBar?: JSX.Element;
}

interface GenericResourceListProps {
  header?: React.ReactNode;
  tableHeader: JSX.Element;
  tableBody: React.ReactNode;
}

interface EmptyResultProps {
  title: Element;
  description: Element;
  action?: Element;
  className?: string;
}

export const EmptyResultView = ({
  title,
  description,
  action,
  className,
}: EmptyResultProps) => {
  return (
    <div className={cn("text-center", className)}>
      <h3 className={cn(tokens.type.h3, "mt-2")}>{title}</h3>
      <p className={cn(tokens.type["small light"], "mt-1 text-gray-500")}>{description}</p>
      {action && (
        <div className="mt-6 flex justify-center w-full">{action}</div>
      )}
    </div>
  );
};

export const ResourceHeader = ({
  title,
  filterBar,
  description = "",
  actions = [],
}: ResourceHeaderProps) => {
  return (
    <div>
      <div>
        {title ? (
          <div className="pb-3">
            <h2 className={cn(tokens.type.h2)}>{title}</h2>
          </div>
        ) : null}
        {description ? (
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        ) : null}
      </div>

      <div className="flex justify-between mb-4">
        {filterBar ? filterBar : null}
        {actions.length > 0 ? <ActionListView actions={actions} /> : null}
      </div>
    </div>
  );
};

export const ResourceListView = ({
  header,
  tableHeader,
  tableBody,
}: GenericResourceListProps) => {
  return (
    <div>
      {header ? <div>{header}</div> : null}

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          {tableHeader}
          <tbody className="divide-y divide-gray-200 bg-white">
            {tableBody}
          </tbody>
        </table>
      </div>
    </div>
  );
};
