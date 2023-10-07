import { useSelector } from "react-redux";

import { selectServicesByAppId, serviceCommandText } from "@app/deploy";
import { AppState, DeployApp, DeployService } from "@app/types";

import { Radio, RadioGroup } from "../select";

const Code = ({ children }: { children: React.ReactNode }) => {
  return (
    <code className="bg-gray-200 font-mono text-black pt-0.5 pb-1 px-1.5 rounded-md text-[0.9rem]">
      {children}
    </code>
  );
};

export const CreateAppEndpointSelector = ({
  app,
  selectedId,
  onSelect,
  disabled = () => false,
}: {
  app: DeployApp;
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: (service: DeployService) => boolean;
}) => {
  const services = useSelector((s: AppState) =>
    selectServicesByAppId(s, { appId: app.id }),
  );

  return (
    <RadioGroup name="service" selected={selectedId} onSelect={onSelect}>
      {services.map((service) => (
        <Radio key={service.id} value={service.id} disabled={disabled(service)}>
          {service.processType} <Code>{serviceCommandText(service)}</Code>
        </Radio>
      ))}
    </RadioGroup>
  );
};
