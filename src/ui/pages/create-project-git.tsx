import cn from "classnames";
import { useEffect, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { selectDataById, selectLoaderById } from "saga-query";
import {
  useApi,
  useCache,
  useLoader,
  useLoaderSuccess,
  useQuery,
} from "saga-query/react";

import { prettyDateRelative, prettyDateTime } from "@app/date";
import {
  appOverviewUrl,
  createProjectAddKeyUrl,
  createProjectAddNameUrl,
  createProjectGitPushUrl,
  createProjectGitSettingsUrl,
  createProjectGitStatusUrl,
} from "@app/routes";
import { fetchSSHKeys } from "@app/ssh-keys";
import {
  AppState,
  DeployApp,
  DeployDatabase,
  DeployDatabaseImage,
  DeployEndpoint,
  DeployOperation,
  HalEmbedded,
  OperationStatus,
} from "@app/types";
import { selectCurrentUser } from "@app/users";

import {
  ApplicationSidebar,
  Banner,
  BannerMessages,
  Box,
  Button,
  ButtonLink,
  ErrorResources,
  FormGroup,
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconGitBranch,
  IconInfo,
  IconPlusCircle,
  IconSettings,
  IconX,
  Input,
  Loading,
  PreCode,
  tokens,
} from "../shared";
import { AddSSHKeyForm } from "../shared/add-ssh-key";
import {
  cancelAppOpsPoll,
  createEndpointOperation,
  fetchAllStacks,
  fetchApp,
  fetchAppOperations,
  fetchDatabasesByEnvId,
  fetchEndpointsByAppId,
  fetchEnvironment,
  pollAppOperations,
  provisionEndpoint,
  selectAppById,
  selectDatabasesByEnvId,
  selectEndpointsByAppId,
  selectEnvironmentById,
  selectServicesByIds,
  selectStackPublicDefault,
} from "@app/deploy";
import {
  fetchServiceDefinitionsByAppId,
  selectServiceDefinitionsByAppId,
} from "@app/deploy/app-service-definitions";
import {
  DeployCodeScanResponse,
  fetchCodeScanResult,
} from "@app/deploy/code-scan-result";
import {
  DeployConfigurationResponse,
  fetchConfiguration,
} from "@app/deploy/configuration";
import {
  fetchAllDatabaseImages,
  selectDatabaseImagesAsList,
} from "@app/deploy/database-images";
import {
  cancelEnvOperationsPoll,
  fetchOperationLogs,
  hasDeployOperation,
  pollEnvOperations,
  selectLatestConfigureOp,
  selectLatestDeployOp,
  selectLatestProvisionOp,
  selectLatestProvisionOps,
  selectLatestScanOp,
  selectLatestSucceessScanOp,
} from "@app/deploy/operation";
import { selectOrganizationSelected } from "@app/organizations";
import {
  DbSelectorProps,
  TextVal,
  createProject,
  deployProject,
  redeployApp,
} from "@app/projects";

export const CreateProjectLayout = () => {
  return (
    <>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <ApplicationSidebar />
      </div>

      <div
        className="md:pl-64 flex flex-col flex-1 h-full bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url(/background-pattern-v2.png)",
        }}
      >
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <div className="flex justify-center container">
                  <div style={{ width: 700 }}>
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export const CreateProjectGitPage = () => {
  const user = useSelector(selectCurrentUser);
  const query = useCache<HalEmbedded<{ ssh_keys: any[] }>>(
    fetchSSHKeys({ userId: user.id }),
  );

  if (query.isInitialLoading) return <Loading />;
  if (query.isError) return <ErrorResources message={query.message} />;
  if (!query.data) return <div>Could not fetch SSH keys</div>;

  if (query.data._embedded.ssh_keys.length === 0) {
    return <Navigate to={createProjectAddKeyUrl()} replace />;
  }

  return <Navigate to={createProjectAddNameUrl()} replace />;
};

const FormNav = ({
  prev = "",
  next = "",
}: {
  prev?: string;
  next?: string;
}) => {
  return (
    <div>
      {prev ? (
        <Link aria-disabled={!prev} to={prev} className="pr-2">
          Prev
        </Link>
      ) : null}
      {next ? (
        <Link aria-disabled={!next} to={next}>
          Next
        </Link>
      ) : null}
    </div>
  );
};

export const CreateProjectAddKeyPage = () => {
  const navigate = useNavigate();
  const onSuccess = () => navigate(createProjectAddNameUrl());

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">
          Add your SSH key to deploy code to Aptible.
        </p>
      </div>

      <FormNav next={createProjectAddNameUrl()} />

      <Box>
        <AddSSHKeyForm onSuccess={onSuccess} />
      </Box>
    </div>
  );
};

export const CreateProjectNamePage = () => {
  const org = useSelector(selectOrganizationSelected);
  const stack = useSelector(selectStackPublicDefault);
  const [name, setName] = useState("");
  const thunk = useApi(
    createProject({ name, stackId: stack.id, orgId: org.id }),
  );
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    thunk.trigger();
  };
  const navigate = useNavigate();
  const stacksQuery = useQuery(fetchAllStacks());

  useEffect(() => {
    stacksQuery.trigger();
  }, [org.id]);

  useLoaderSuccess(thunk, () => {
    navigate(createProjectGitPushUrl(thunk.meta.appId));
  });

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">Provide a name for your project.</p>
      </div>

      <FormNav prev={createProjectAddKeyUrl()} />

      <Box>
        <div className="my-2">Stack: {stack.name}</div>
        <form onSubmit={onSubmit}>
          <FormGroup label="Project Name" htmlFor="name" feedbackVariant="info">
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              autoFocus
            />
          </FormGroup>

          {thunk.isError ? (
            <BannerMessages {...thunk} className="my-2" />
          ) : null}

          <Button
            className="mt-4 w-full"
            type="submit"
            isLoading={thunk.isLoading}
          >
            Create project
          </Button>
        </form>
      </Box>
    </div>
  );
};

const OpResult = ({ op }: { op: DeployOperation }) => {
  const postfix = `operation: ${op.id}`;
  if (op.status === "failed") {
    return (
      <Banner variant="error">
        {op.type} operation failed, {postfix}
      </Banner>
    );
  }
  if (op.status === "succeeded") {
    return (
      <Banner variant="success">
        {op.type} success, {postfix}
      </Banner>
    );
  }
  if (op.status === "running") {
    return (
      <Banner variant="info">
        {op.type} detected (running), {postfix}
      </Banner>
    );
  }
  return (
    <Banner variant="info">
      {op.type} detected (queued), {postfix}
    </Banner>
  );
};

export const CreateProjectGitPushPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appId = "" } = useParams();

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  useQuery(pollAppOperations({ id: appId }));
  const scanOp = useSelector((s: AppState) => selectLatestScanOp(s, { appId }));
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );

  useEffect(() => {
    const cancel = () => dispatch(cancelAppOpsPoll());
    cancel();
    dispatch(pollAppOperations({ id: appId }));
    return () => {
      cancel();
    };
  }, [appId]);

  useEffect(() => {
    if (scanOp && scanOp.status === "succeeded") {
      navigate(createProjectGitSettingsUrl(appId));
    }
  }, [scanOp]);

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">Git push your code to continue.</p>
      </div>

      <FormNav
        prev={createProjectAddKeyUrl()}
        next={createProjectGitSettingsUrl(appId)}
      />
      <Box>
        <div>
          <h3 className={tokens.type.h3}>Add Aptible's Git Server</h3>
          <PreCode
            text={["git", "remote", "add", "aptible", app.gitRepo]}
            allowCopy
          />
        </div>
        <div className="mt-4">
          <h3 className={tokens.type.h3}>Push your code to our scan branch</h3>
          <PreCode
            text={["git", "push", "aptible", "main:aptible-scan"]}
            allowCopy
          />
        </div>

        <hr className="my-4" />

        {hasDeployOperation(deployOp) ? (
          <div>
            We detected an app deployment, did you push to the{" "}
            <code>aptible-scan</code> branch?
          </div>
        ) : null}

        {hasDeployOperation(scanOp) ? (
          <OpResult op={scanOp} />
        ) : (
          <Loading text="Waiting for git push ..." />
        )}
      </Box>
    </div>
  );
};

const trim = (t: string) => t.trim();
const parseText = <
  M extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  text: string,
  meta: () => M,
): TextVal<M>[] =>
  text
    .split("\n")
    .map(trim)
    .map((t) => {
      const vals = t.split("=").map(trim);
      return {
        key: vals[0],
        value: vals[1],
        meta: meta(),
      };
    })
    .filter((t) => !!t.key);

interface ValidatorError {
  item: TextVal;
  message: string;
}

interface DbValidatorError {
  message: string;
  item: DbSelectorProps;
}

const validateDbs = (items: DbSelectorProps[]): DbValidatorError[] => {
  const errors: DbValidatorError[] = [];
  const envVars = new Set();

  const validate = (item: DbSelectorProps) => {
    if (!/^[0-9a-z._-]{1,64}$/.test(item.name)) {
      errors.push({
        item,
        message: `[${item.name}] is not a valid handle: /\A[0-9a-z._-]{1,64}\z/`,
      });
    }

    if (envVars.has(item.env)) {
      errors.push({
        item,
        message: `${item.env} has already been used, each database env var must be unique`,
      });
    } else {
      envVars.add(item.env);
    }
  };

  items.forEach(validate);
  return errors;
};

const validateEnvs = (items: TextVal[]): ValidatorError[] => {
  const errors: ValidatorError[] = [];

  const validate = (item: TextVal) => {
    // https://stackoverflow.com/a/2821201
    if (!/[a-zA-Z_]+[a-zA-Z0-9_]*/.test(item.key)) {
      errors.push({
        item,
        message: `${item.key} does not match regex: /[a-zA-Z_]+[a-zA-Z0-9_]*/`,
      });
    }
  };

  items.forEach(validate);
  return errors;
};

const useLatestCodeResults = (appId: string) => {
  const appOps = useQuery(fetchAppOperations({ id: appId }));
  const scanOp = useSelector((s: AppState) =>
    selectLatestSucceessScanOp(s, { appId }),
  );

  const codeScan = useCache<DeployCodeScanResponse>(
    fetchCodeScanResult({ id: scanOp.codeScanResultId }),
  );

  return { scanOp, codeScan, appOps };
};

const DatabaseNameInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) => {
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };
  return (
    <FormGroup
      label="Database alias"
      htmlFor="dbname"
      description="This is the name of the database which is an alias for your reference"
    >
      <Input name="dbname" value={value} onChange={change} />
    </FormGroup>
  );
};

const DatabaseEnvVarInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) => {
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };
  return (
    <FormGroup
      label="Environment variable"
      htmlFor="envvar"
      description="We will automatically inject this environment variable into your app with the correct connection string"
    >
      <Input name="envvar" value={value} onChange={change} />
    </FormGroup>
  );
};

const idCreator = () => {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
};
const createId = idCreator();

const Selector = ({
  db,
  images,
  propChange,
  onDelete,
}: {
  db: DbSelectorProps;
  images: DeployDatabaseImage[];
  propChange: (d: DbSelectorProps) => void;
  onDelete: () => void;
}) => {
  const selectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const imgId = e.currentTarget.value;
    const img = images.find((i) => i.id === imgId);
    propChange({
      ...db,
      imgId,
      name: `${db.name}-${img?.type || ""}`,
      dbType: img?.type || "",
    });
  };

  const sel = (
    <div>
      <div className="mb-2">
        <DatabaseNameInput
          value={db.name}
          onChange={(value) => propChange({ ...db, name: value })}
        />
      </div>
      <DatabaseEnvVarInput
        value={db.env}
        onChange={(value) => propChange({ ...db, env: value })}
      />
    </div>
  );

  return (
    <div className="my-4">
      <div className="flex justify-between items-center">
        <select
          onChange={selectChange}
          value={db.imgId}
          className="mb-2"
          placeholder="select"
        >
          <option value="" disabled>
            select a db
          </option>
          {images.map((img) => (
            <option key={img.id} value={img.id}>
              {img.type}:{img.version}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={onDelete}>
          Delete
        </Button>
      </div>
      {db.imgId ? sel : null}
      <hr className="my-4" />
    </div>
  );
};

type DbSelectorAction =
  | { type: "add"; payload: DbSelectorProps }
  | { type: "rm"; payload: string };

function dbSelectorReducer(
  state: { [key: string]: DbSelectorProps },
  action: DbSelectorAction,
) {
  if (action.type === "add") {
    return { ...state, [action.payload.id]: action.payload };
  }

  if (action.type === "rm") {
    const nextState = { ...state };
    (nextState as any)[action.payload] = undefined;
    return nextState;
  }

  return state;
}

const DatabaseSelectorForm = ({
  dbMap,
  dispatch,
  namePrefix,
  images,
}: {
  dbMap: { [key: string]: DbSelectorProps };
  dispatch: (action: any) => void;
  namePrefix: string;
  images: DeployDatabaseImage[];
}) => {
  const onClick = () => {
    const payload: DbSelectorProps = {
      id: `${createId()}`,
      imgId: "",
      name: namePrefix,
      env: "DATABASE_URL",
      dbType: "",
    };
    dispatch({
      type: "add",
      payload,
    });
  };

  return (
    <div>
      {Object.values(dbMap)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((db) => {
          return (
            <Selector
              key={db.id}
              images={images}
              db={db}
              propChange={(payload) => dispatch({ type: "add", payload })}
              onDelete={() => dispatch({ type: "rm", payload: db.id })}
            />
          );
        })}
      <Button type="button" onClick={onClick}>
        <IconPlusCircle className="mr-2" /> New
      </Button>
    </div>
  );
};

export const CreateProjectGitSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appId = "" } = useParams();

  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const { scanOp, codeScan, appOps } = useLatestCodeResults(appId);
  useQuery(fetchDatabasesByEnvId({ envId: app.environmentId }));

  useQuery(fetchAllDatabaseImages());
  const dbImages = useSelector(selectDatabaseImagesAsList);

  useQuery(fetchServiceDefinitionsByAppId({ appId }));
  const serviceDefinitions = useSelector((s: AppState) =>
    selectServiceDefinitionsByAppId(s, { appId }),
  );

  const existingDbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId: app.environmentId }),
  );

  const curConfig = useCache<DeployConfigurationResponse>(
    fetchConfiguration({ id: app.currentConfigurationId }),
  );
  const existingEnvStr = Object.keys(curConfig.data?.env || {}).reduce(
    (acc, key) => {
      const value = curConfig.data?.env[key];
      const prev = acc ? `${acc}\n` : "";
      return `${prev}${key}=${value}`;
    },
    "",
  );

  useEffect(() => {
    setEnvs(existingEnvStr);
  }, [existingEnvStr]);

  const [dbMap, dbDispatch] = useReducer(dbSelectorReducer, {});
  const dbList = Object.values(dbMap).sort((a, b) => a.id.localeCompare(b.id));
  const [dbErrors, setDbErrors] = useState<DbValidatorError[]>([]);
  const [envs, setEnvs] = useState(existingEnvStr);
  const [envErrors, setEnvErrors] = useState<ValidatorError[]>([]);
  const [cmds, setCmds] = useState("");
  const cmdList = parseText(cmds, () => ({ id: "", http: false }));

  const loader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${deployProject}` }),
  );

  useEffect(() => {
    if (serviceDefinitions.length === 0) {
      return;
    }

    // hydrate inputs for consumption on load
    const cmdsToSet = serviceDefinitions
      ? serviceDefinitions
          .map((serviceDefinition) => {
            return `${serviceDefinition.processType}=${serviceDefinition.command}`;
          })
          .join("\n")
      : "";
    setCmds(cmdsToSet);
  }, [serviceDefinitions.length]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let cancel = false;

    const dberr = validateDbs(dbList);
    if (dberr.length > 0) {
      cancel = true;
      setDbErrors(dberr);
    } else {
      setDbErrors([]);
    }

    const envList = parseText(envs, () => ({}));
    const enverr = validateEnvs(envList);
    if (enverr.length > 0) {
      cancel = true;
      setEnvErrors(enverr);
    } else {
      setEnvErrors([]);
    }

    if (cancel) {
      return;
    }

    dispatch(
      deployProject({
        appId,
        envId: app.environmentId,
        // don't create new databases if they already exist
        dbs: existingDbs.length > 0 ? [] : dbList,
        envs: envList,
        curEnvs: curConfig.data?.env || {},
        cmds: cmdList,
        gitRef: scanOp.gitRef || "main",
      }),
    );

    navigate(createProjectGitStatusUrl(appId));
  };

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">
          Review settings and click deploy to finish.
        </p>
      </div>

      <FormNav
        prev={createProjectGitPushUrl(appId)}
        next={createProjectGitStatusUrl(appId)}
      />

      <Box>
        {codeScan.isInitialLoading ? (
          <Loading text="Loading code scan results ..." />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h3 className={tokens.type.h3}>Code scan results</h3>
              <Button
                variant="white"
                isLoading={appOps.isLoading}
                onClick={() => appOps.trigger()}
              >
                Refresh
              </Button>
            </div>

            <dl className="mt-2">
              <dd>Last scan</dd>
              <dt>{prettyDateTime(scanOp.updatedAt)}</dt>

              <dd>
                <code>Dockerfile</code> detected?
              </dd>
              <dt>{codeScan.data?.dockerfile_present ? "Yes" : "No"}</dt>

              <dd>
                <code>Procfile</code> detected?
              </dd>
              <dt>{codeScan.data?.procfile_present ? "Yes" : "No"}</dt>

              <dd>
                <code>aptible.yml</code> detected?
              </dd>
              <dt>{codeScan.data?.aptible_yml_present ? "Yes" : "No"}</dt>
            </dl>
          </div>
        )}
      </Box>

      <Box>
        <form onSubmit={onSubmit}>
          <FormGroup
            label="Required Databases"
            htmlFor="databases"
            feedbackVariant={dbErrors ? "danger" : "info"}
            feedbackMessage={dbErrors.map((e) => e.message).join(". ")}
            description={
              <div>
                {existingDbs.length > 0 ? (
                  <p>
                    Databases have already been created so you cannot make
                    changes to them in this screen anymore.
                  </p>
                ) : null}
              </div>
            }
          >
            {existingDbs.length > 0 ? null : (
              <DatabaseSelectorForm
                images={dbImages}
                namePrefix={app.handle}
                dbMap={dbMap}
                dispatch={dbDispatch}
              />
            )}
          </FormGroup>

          <hr className="my-4" />

          <FormGroup
            label="Environment Variables"
            htmlFor="envs"
            feedbackVariant={envErrors.length > 0 ? "danger" : "info"}
            feedbackMessage={envErrors.map((e) => e.message).join(". ")}
            description="Environment Variables (each line is a separate variable in format: ENV_VAR=VALUE)."
          >
            <textarea
              name="envs"
              className={tokens.type.textarea}
              value={envs}
              onChange={(e) => setEnvs(e.currentTarget.value)}
            />
          </FormGroup>

          <hr className="my-4" />

          {codeScan.data?.procfile_present ? null : (
            <FormGroup
              label="Service and Commands"
              htmlFor="commands"
              feedbackVariant="info"
              description="Each line is separated by a service command in format: NAME=COMMAND."
            >
              <textarea
                name="commands"
                className={tokens.type.textarea}
                value={cmds}
                onChange={(e) => setCmds(e.currentTarget.value)}
              />
            </FormGroup>
          )}

          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={loader.isLoading}
          >
            Save & Deploy
          </Button>
        </form>
      </Box>
    </div>
  );
};

const createReadableResourceName = (
  op: DeployOperation,
  handle: string,
): string => {
  if (op.resourceType === "app" && op.type === "deploy") {
    return "App deployment";
  }

  if (op.resourceType === "database" && op.type === "provision") {
    return `Database provision ${handle}`;
  }

  if (op.resourceType === "app" && op.type === "configure") {
    return "Initial configuration";
  }

  if (op.resourceType === "vhost" && op.type === "provision") {
    return "HTTPS endpoint provision";
  }

  return `${op.resourceType}:${op.type}`;
};

const createReadableStatus = (status: OperationStatus): string => {
  switch (status) {
    case "queued":
      return "Queued";
    case "running":
      return "Pending";
    case "succeeded":
      return "DONE";
    case "failed":
      return "FAILED";
    default:
      return status;
  }
};

const Op = ({
  op,
  resource,
  retry,
}: {
  op: DeployOperation;
  resource: { handle: string };
  retry?: () => void;
}) => {
  const [isOpen, setOpen] = useState(false);
  if (!hasDeployOperation(op)) {
    return null;
  }
  const extra = "border-b border-black-100";
  const status = () => {
    const cns = "font-semibold flex justify-center items-center";

    if (op.status === "succeeded") {
      return (
        <div className={cn(cns, "text-forest")}>
          {createReadableStatus(op.status)}
        </div>
      );
    }

    if (op.status === "failed") {
      return (
        <div className={cn(cns, "text-red")}>
          {retry ? (
            <Button
              variant="white"
              onClick={(e) => {
                e.stopPropagation();
                retry();
              }}
              className="mr-2"
            >
              retry
            </Button>
          ) : null}
          {createReadableStatus(op.status)}
        </div>
      );
    }

    return (
      <div className={cn(cns, "text-black-500")}>
        {createReadableStatus(op.status)}
      </div>
    );
  };

  return (
    <div className={extra}>
      <div
        className="py-4 flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!isOpen)}
        onKeyUp={() => setOpen(!isOpen)}
      >
        <div className="font-semibold flex items-center">
          {isOpen ? (
            <IconChevronUp variant="sm" />
          ) : (
            <IconChevronDown variant="sm" />
          )}
          <div>{createReadableResourceName(op, resource.handle)}</div>
        </div>
        {status()}
      </div>
      {isOpen ? (
        <div className="pb-4">
          <LogViewer op={op} />
        </div>
      ) : null}
    </div>
  );
};

const DatabaseStatus = ({
  db,
}: {
  db: Pick<DeployDatabase, "id" | "handle">;
}) => {
  const provisionOp = useSelector((s: AppState) =>
    selectLatestProvisionOp(s, { resourceId: db.id }),
  );

  return <Op op={provisionOp} resource={db} />;
};

const EndpointStatus = ({
  endpoint,
}: {
  endpoint: Pick<DeployEndpoint, "id">;
}) => {
  const dispatch = useDispatch();
  const provisionOp = useSelector((s: AppState) =>
    selectLatestProvisionOp(s, { resourceId: endpoint.id }),
  );
  const retry = () => {
    dispatch(
      createEndpointOperation({
        type: "provision",
        endpointId: endpoint.id,
      }),
    );
  };

  return <Op op={provisionOp} resource={{ handle: "" }} retry={retry} />;
};

const AppStatus = ({
  app,
  gitRef,
}: {
  app: Pick<DeployApp, "id" | "handle" | "environmentId">;
  gitRef: string;
}) => {
  const dispatch = useDispatch();
  const configOp = useSelector((s: AppState) =>
    selectLatestConfigureOp(s, { appId: app.id }),
  );
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  const retry = () => {
    dispatch(
      redeployApp({
        appId: app.id,
        envId: app.environmentId,
        gitRef,
        force: true,
      }),
    );
  };

  return (
    <div>
      <Op op={configOp} resource={app} retry={retry} />
      <Op op={deployOp} resource={app} retry={retry} />
    </div>
  );
};

const ProjectStatus = ({
  app,
  dbs,
  endpoints,
  gitRef,
}: {
  app: DeployApp;
  dbs: DeployDatabase[];
  endpoints: DeployEndpoint[];
  gitRef: string;
}) => {
  return (
    <div>
      {dbs.map((db) => {
        return <DatabaseStatus key={db.id} db={db} />;
      })}

      <AppStatus app={app} gitRef={gitRef} />

      {endpoints.map((vhost) => {
        return <EndpointStatus key={vhost.id} endpoint={vhost} />;
      })}
    </div>
  );
};

const resolveOperationStatuses = (
  stats: { status: OperationStatus; updatedAt: string }[],
): [OperationStatus, string] => {
  // sort the statuses from least recent to most recent
  // this allows us to return-early with the proper time in which the states
  // were first determined
  const statuses = stats.sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  );

  let success = 0;
  for (let i = 0; i < statuses.length; i += 1) {
    const st = statuses[i];
    if (st.status === "queued") {
      return ["queued", st.updatedAt];
    }

    if (st.status === "running") {
      return ["running", st.updatedAt];
    }

    if (st.status === "failed") {
      return ["failed", st.updatedAt];
    }

    if (st.status === "succeeded") {
      success += 1;
    }
  }

  if (success === statuses.length) {
    return [
      "succeeded",
      statuses.at(-1)?.updatedAt || new Date().toISOString(),
    ];
  }

  return ["unknown", new Date().toISOString()];
};

const Pill = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: JSX.Element;
}) => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold text-black-500",
    "ml-2 px-2 flex justify-between items-center w-fit",
  );
  return (
    <div className={className}>
      {icon}
      <div className="ml-1">{children}</div>
    </div>
  );
};

const StatusPill = ({
  status,
  from,
}: {
  status: OperationStatus;
  from: string;
}) => {
  const date = prettyDateRelative(from);

  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  if (status === "running" || status === "queued") {
    return (
      <div className={cn(className, "text-brown border-brown bg-orange-100")}>
        <IconSettings color="#825804" className="mr-1" variant="sm" />
        <div>
          {status === "running" ? "Building" : "Queued"} {date}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={cn(className, "text-red border-red-300 bg-red-100")}>
        <IconX color="#AD1A1A" variant="sm" />
        <div>Failed {date}</div>
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className={cn(className, "text-forest border-lime-300 bg-lime-100")}>
        <IconCheck color="#00633F" className="mr-1" variant="sm" />
        Deployed {date}
      </div>
    );
  }

  return (
    <div
      className={cn(className, "text-indigo border-indigo-300 bg-indigo-100")}
    >
      <IconInfo color="#4361FF" className="mr-1" variant="sm" />
      Unknown {date}
    </div>
  );
};

const LogLine = ({ text }: { text: string }) => {
  const parts = text.split("-- :");
  if (parts.length === 1) {
    return (
      <div>
        <span className="text-lime">{parts[0]}</span>
      </div>
    );
  }

  const leftPart = parts[0]
    .replace("+0000", "")
    .replace(/\d\d\d\d-\d\d-\d\d/, "")
    .trim();
  const rightPart = parts[1].trim();

  const Type = () => {
    if (leftPart.endsWith("ERROR")) {
      return <span className="text-red-300">{rightPart}</span>;
    }

    if (leftPart.endsWith("WARNING")) {
      return <span className="text-orange-300">{rightPart}</span>;
    }

    return <span className="text-lime">{rightPart}</span>;
  };

  return (
    <div className="text-sm">
      <span className="text-black-200">{leftPart}: </span>
      <Type />
    </div>
  );
};

const LogViewer = ({ op }: { op: DeployOperation }) => {
  const wrapper = "font-mono bg-black p-2 rounded-lg text-black-200";
  const action = fetchOperationLogs({ id: op.id });
  const loader = useApi(action);
  const data: string = useSelector((s: AppState) =>
    selectDataById(s, { id: action.payload.key }),
  );
  useEffect(() => {
    if (op.status === "succeeded" || op.status === "failed") {
      loader.trigger();
    }
  }, [op.status]);

  if (op.status === "queued" || op.status === "running") {
    return (
      <div className={wrapper}>
        Operation {op.status}, logs will display after operation completes.
      </div>
    );
  }

  if (loader.isInitialLoading) {
    return <div className={wrapper}>Fetching logs ...</div>;
  }

  if (!data) {
    return <div className={wrapper}>No data found</div>;
  }

  return (
    <div className={wrapper}>
      {data.split("\n").map((line, i) => {
        return <LogLine key={`log-${i}`} text={line} />;
      })}
    </div>
  );
};

const StatusBox = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mt-8">
      <div className="bg-white p-5 shadow rounded-lg border border-black-100">
        {children}
      </div>
    </div>
  );
};

const Code = ({ children }: { children: React.ReactNode }) => {
  return <code className="bg-orange-200 p-[2px]">{children}</code>;
};

const CreateEndpointView = ({
  app,
  serviceId,
}: {
  app: DeployApp;
  serviceId: string;
}) => {
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: app.serviceIds }),
  );
  const dispatch = useDispatch();
  const [curServiceId, setServiceId] = useState(serviceId);
  const action = provisionEndpoint({ serviceId: curServiceId });
  const loader = useLoader(action);
  const onChange = (id: string) => {
    setServiceId(id);
  };
  const onClick = () => {
    dispatch(action);
  };

  useEffect(() => {
    setServiceId(serviceId);
  }, [serviceId]);

  return (
    <div>
      {services.map((service) => {
        return (
          <div key={service.id}>
            <input
              type="radio"
              key="service"
              value={service.id}
              checked={curServiceId === service.id}
              onChange={() => onChange(service.id)}
              disabled={!!serviceId}
            />
            <span className="ml-1">
              {service.processType} <Code>{service.command}</Code>
            </span>
          </div>
        );
      })}
      <Button
        onClick={onClick}
        isLoading={loader.isLoading}
        disabled={!!serviceId}
        className="mt-4"
      >
        Create endpoint
      </Button>
    </div>
  );
};

export const CreateProjectGitStatusPage = () => {
  const { appId = "" } = useParams();
  const dispatch = useDispatch();
  const appQuery = useQuery(fetchApp({ id: appId }));
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const envId = app.environmentId;
  useQuery(fetchEnvironment({ id: envId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );
  useQuery(fetchDatabasesByEnvId({ envId }));
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId }),
  );
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  const endpointQuery = useQuery(fetchEndpointsByAppId({ appId }));
  const vhosts = useSelector((s: AppState) =>
    selectEndpointsByAppId(s, { id: appId }),
  );
  const vhost = vhosts.length > 0 ? vhosts[0] : null;
  const resourceIds = [...dbs.map((db) => db.id), ...vhosts.map((v) => v.id)];
  const provisionOps = useSelector((s: AppState) =>
    selectLatestProvisionOps(s, {
      resourceIds,
    }),
  );

  const ops = [deployOp, ...provisionOps];
  const [status, dateStr] = resolveOperationStatuses(ops);
  const { isInitialLoading } = useQuery(pollEnvOperations({ envId }));

  const cancel = () => dispatch(cancelEnvOperationsPoll());
  useEffect(() => {
    cancel();
    dispatch(pollEnvOperations({ envId }));

    return () => {
      cancel();
    };
  }, [appId, envId]);

  const { scanOp } = useLatestCodeResults(appId);
  const redeployLoader = useSelector((s: AppState) =>
    selectLoaderById(s, { id: `${redeployApp}` }),
  );
  const gitRef = scanOp.gitRef || "main";
  const redeploy = (force: boolean) => {
    dispatch(
      redeployApp({
        appId,
        envId: env.id,
        gitRef,
        force,
      }),
    );
  };

  // if the user started the deployment process but left before
  // we could create an app deploy operation then we need to kick that
  // off again here
  useEffect(() => {
    if (!hasDeployOperation(deployOp)) {
      dispatch(
        redeployApp({
          appId,
          envId: env.id,
          gitRef,
          force: true,
        }),
      );
    }
  }, []);

  // when the status is success we need to refetch the app and endpoints
  // so we can grab the services and show them to the user for creating
  // an endpoint.
  useEffect(() => {
    if (status !== "succeeded") return;
    appQuery.trigger();
    endpointQuery.trigger();
  }, [status]);

  const header = () => {
    if (status === "succeeded") {
      return (
        <div className="text-center">
          <h1 className={tokens.type.h1}>Deployed your Code</h1>
          <p className="my-4 text-gray-600">
            All done! Deployment completed successfully
          </p>
        </div>
      );
    }

    if (status === "failed") {
      return (
        <div className="text-center">
          <h1 className={tokens.type.h1}>Deployment Failed</h1>
          <p className="my-4 text-gray-600">
            Don't worry! Edit your project settings and click Redeploy when
            ready.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploying your Code</h1>
        <p className="my-4 text-gray-600">Estimated wait time is 5 minutes.</p>
      </div>
    );
  };

  return (
    <div>
      {header()}

      <FormNav prev={createProjectGitSettingsUrl(appId)} />
      <StatusBox>
        <div className="border-b border-black-100 pb-4 ">
          <div className="flex items-center">
            <div>
              <img
                alt="default project logo"
                src="/logo-app.png"
                style={{ width: 32, height: 32 }}
                className="mr-3"
              />
            </div>
            <div>
              <h4 className={tokens.type.h4}>{env.handle}</h4>
              <p className="text-black-500 text-sm">
                {vhost ? (
                  <a
                    href={`https://${vhost.virtualDomain}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://{vhost.virtualDomain}
                  </a>
                ) : (
                  "pending http endpoint"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center mt-1">
            <StatusPill status={status} from={dateStr} />
            <Pill icon={<IconGitBranch color="#595E63" variant="sm" />}>
              {deployOp.gitRef.slice(0, 12)}
            </Pill>
          </div>
        </div>

        {isInitialLoading ? (
          <Loading text="Loading resources ..." />
        ) : (
          <ProjectStatus
            app={app}
            dbs={dbs}
            endpoints={vhosts}
            gitRef={gitRef}
          />
        )}
      </StatusBox>

      {deployOp.status === "succeeded" && !vhost?.serviceId ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Which service needs an endpoint?</h4>
          <CreateEndpointView app={app} serviceId={vhost?.serviceId || ""} />
        </StatusBox>
      ) : null}

      {deployOp.status === "failed" ? (
        <StatusBox>
          <h4 className={tokens.type.h4}>Deployment failed</h4>
          <p className="text-black-500 my-4">
            If the app deployment failed, you can view the error logs, make code
            changes, and then push the code to us to redeploy. This screen will
            track your deployment status.
          </p>
          <p className="text-black-500 my-4">
            You can also try to trigger a redeploy now if you think it was a
            transient error that caused the deployment to fail.
          </p>

          <Button
            onClick={() => redeploy(true)}
            isLoading={redeployLoader.isLoading}
          >
            Redeploy
          </Button>
          <p>{redeployLoader.isError ? redeployLoader.message : ""}</p>
        </StatusBox>
      ) : null}

      <StatusBox>
        <h4 className={tokens.type.h4}>How to deploy changes</h4>
        <p className="mb-2 text-black-500">
          Commit changes to your local git repo and push to the Aptible git
          server.
        </p>
        <PreCode text={["git", "push", "aptible", "main"]} allowCopy />
        <hr />

        <ButtonLink to={appOverviewUrl(appId)} className="mt-4 mb-2">
          View Project <IconArrowRight variant="sm" className="ml-2" />
        </ButtonLink>
      </StatusBox>
    </div>
  );
};
