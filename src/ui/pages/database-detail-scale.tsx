import {
  fetchDatabase,
  fetchDiskById,
  fetchService,
  scaleDatabase,
  selectDatabaseById,
  selectDiskById,
  selectServiceById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { databaseActivityUrl } from "@app/routes";
import { diskSizeValidator } from "@app/validator";
import { useNavigate, useParams } from "react-router";
import {
  defaultDatabaseScaler,
  useDatabaseScaler,
  useValidator,
} from "../hooks";
import {
  BannerMessages,
  Box,
  Button,
  ContainerProfileInput,
  ContainerSizeInput,
  CpuShareView,
  DiskSizeInput,
  PricingCalc,
} from "../shared";

interface DatabaseScaleProps {
  diskSize: number;
}

const validators = {
  diskSize: (data: DatabaseScaleProps) => diskSizeValidator(data.diskSize),
};

export const DatabaseScalePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [errors, validate] = useValidator<
    DatabaseScaleProps,
    typeof validators
  >(validators);

  useQuery(fetchDatabase({ id }));
  const database = useSelector((s) => selectDatabaseById(s, { id }));
  const serviceLoader = useQuery(fetchService({ id: database.serviceId }));
  useQuery(fetchDiskById({ id: database.diskId }));
  const disk = useSelector((s) => selectDiskById(s, { id: database.diskId }));
  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );

  const {
    scaler,
    dispatchScaler,
    changesExist,
    currentPricePerGBHour,
    currentPrice,
    requestedPricePerGBHour,
    estimatedPrice,
    requestedContainerProfile,
    currentContainerProfile,
  } = useDatabaseScaler({
    service,
    disk,
  });
  const hasChanges = changesExist && !serviceLoader.isInitialLoading;
  const action = scaleDatabase({
    id,
    ...scaler,
  });

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(scaler)) return;
    dispatch(action);
  };
  const loader = useLoader(scaleDatabase);

  useLoaderSuccess(loader, () => {
    navigate(databaseActivityUrl(database.id));
  });

  return (
    <Box>
      <form onSubmit={onSubmitForm}>
        <div className="flex flex-col gap-2">
          <ContainerProfileInput
            scaler={scaler}
            dispatchScaler={dispatchScaler}
            envId={database.environmentId}
          />
          <DiskSizeInput
            scaler={scaler}
            dispatchScaler={dispatchScaler}
            error={errors.diskSize}
          />
          <ContainerSizeInput scaler={scaler} dispatchScaler={dispatchScaler} />
          <CpuShareView
            cpuShare={requestedContainerProfile.cpuShare}
            containerSize={scaler.containerSize}
          />
        </div>

        <PricingCalc
          service={service}
          disk={disk}
          pricePerGBHour={currentPricePerGBHour}
          price={currentPrice}
        />

        <hr />

        {hasChanges ? (
          <div className="text-md font-semibold text-gray-900 mt-4">
            Pending Changes
          </div>
        ) : null}
        {scaler.containerProfile !== service.instanceClass ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Container Profile</div>
            <p className="text-black-500">
              Changed from {currentContainerProfile.name} to{" "}
              {requestedContainerProfile.name}
            </p>
          </div>
        ) : null}
        {scaler.diskSize !== disk.size ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Disk Size</div>
            <p className="text-black-500">
              Changed from {disk.size} GB to {scaler.diskSize} GB
            </p>
          </div>
        ) : null}
        {scaler.containerSize !== service.containerMemoryLimitMb ? (
          <div className="my-3">
            <div className="text-md text-gray-900">Container Size</div>
            <p className="text-black-500">
              Changed from {service.containerMemoryLimitMb / 1024} GB to{" "}
              {scaler.containerSize / 1024} GB
            </p>
          </div>
        ) : null}
        {hasChanges ? (
          <div className="my-3 flex justify-between">
            <div>
              <div className="text-md text-gray-900">Pricing</div>
              <p className="text-black-500">
                1 x {scaler.containerSize / 1024} GB container x $
                {requestedPricePerGBHour.toFixed(2)} per GB/hour
              </p>
            </div>
            <div>
              <p className="text-black-500">New Estimated Monthly Cost</p>
              <p className="text-right text-lg text-green-400">
                ${estimatedPrice.toFixed(2)}
              </p>
            </div>
          </div>
        ) : null}

        <BannerMessages {...loader} />

        <div className="flex mt-4">
          <Button
            className="w-40 flex font-semibold"
            disabled={!hasChanges}
            type="submit"
          >
            Save Changes
          </Button>
          {hasChanges ? (
            <Button
              className="w-40 ml-2 flex font-semibold"
              onClick={() => {
                dispatchScaler({
                  type: "set",
                  payload: defaultDatabaseScaler(service, disk),
                });
              }}
              variant="white"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Box>
  );
};
