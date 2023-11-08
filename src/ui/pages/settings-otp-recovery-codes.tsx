import { useCache } from "@app/fx";
import { fetchOtpCodes } from "@app/mfa";
import { securitySettingsUrl } from "@app/routes";
import { HalEmbedded } from "@app/types";
import { useCurrentUser } from "../hooks";
import {
  BannerMessages,
  Box,
  BoxGroup,
  Breadcrumbs,
  Group,
  Loading,
  PreCode,
} from "../shared";

interface OtpCode {
  id: string;
  value: string;
  used: boolean;
}
type OtpResponse = HalEmbedded<{ otp_recovery_codes: OtpCode[] }>;

export const OtpRecoveryCodesPage = () => {
  const [user] = useCurrentUser();
  const loader = useCache<OtpResponse>(
    fetchOtpCodes({ otpId: user.currentOtpId }),
  );
  const codes = loader.data?._embedded?.otp_recovery_codes || [];

  return (
    <BoxGroup>
      <Breadcrumbs
        crumbs={[
          { name: "Security Settings", to: securitySettingsUrl() },
          { name: "Recovery Codes", to: null },
        ]}
      />
      <Box>
        <Group>
          {loader.isInitialLoading ? <Loading /> : null}

          <BannerMessages {...loader} />

          <p>Backup codes can only be used once. Keep them somewhere safe.</p>

          <p>
            If you run out, you'll need to disable and re-enable 2-factor
            authentication.
          </p>

          <PreCode
            allowCopy
            segments={codes
              .filter((c) => c.used === false)
              .map((c) => ({ text: c.value, className: "text-lime" }))}
          />
        </Group>
      </Box>
    </BoxGroup>
  );
};
