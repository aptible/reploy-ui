import { HeroBgLayout } from "../layouts";
import {
  AptibleLogo,
  Box,
  BoxGroup,
  Button,
  CreateProjectFooter,
  FormGroup,
  Input,
  Select,
  SelectOption,
  tokens,
} from "../shared";

import { countries, states } from "@app/geography";
import { logoutUrl } from "@app/routes";
import { useState } from "react";
import { Link } from "react-router-dom";

export const BillingMethodPage = () => {
  const [creditCardNumber, setCreditCardNumber] = useState<string>("");
  const [expiration, setExpiration] = useState<string>("");
  const [securityCode, setSecurityCode] = useState<string>("");
  const [nameOnCard, setNameOnCard] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [aptSuiteEtc, setAptSuiteEtc] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  const stateOptions = states.map(({ shortCode, label }) => ({
    value: shortCode,
    label,
  }));
  const countryOptions = countries.map(({ shortCode, label }) => ({
    value: shortCode,
    label,
  }));

  const selectCountry = (option: SelectOption) => {
    setCountry(option.value);
  };
  const selectState = (option: SelectOption) => {
    setState(option.value);
  };

  const selectedState = stateOptions.find(
    (stateOption) => stateOption.value === state,
  );
  const selectedCountry = countryOptions.find(
    (countryOption) => countryOption.value === country,
  );

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <HeroBgLayout width={500} showLogo={false}>
      <div className="absolute top-0 left-0 h-auto min-h-[100vh] bg-white/90 shadow p-16 lg:block hidden w-[40vw] lg:px-[5%] px-[32px]">
        <div className="text-xl text-black font-bold">
          Launch, grow, and scale your app without worrying about infrastructure
        </div>
        <div className="text-lg text-gold font-bold pt-5 pb-1">Launch</div>
        <p>Get up and running without any work or config.</p>
        <hr className="mt-5 mb-4" />
        <div className="text-lg text-gold font-bold pb-1">Grow</div>
        <p>Aptible handles all the infrastructure operations.</p>
        <hr className="mt-5 mb-4" />
        <div className="text-lg text-gold font-bold pb-1">Scale</div>
        <p>
          Enterprise requirements such as performance, security, and reliability
          are baked in from day one.
        </p>
        <p className="text-md text-black pt-8 pb-4 text-center font-semibold">
          Companies that have scaled with Aptible
        </p>
        <img
          src="/customer-logo-cloud.png"
          className="text-center scale-90"
          aria-label="Customer Logos"
        />
        <div className="pt-8 lg:px-0 px-10">
          <CreateProjectFooter />
        </div>
      </div>
      <div className="absolute lg:top-[30px] md:top-0 top-0 left-0  lg:w-[60vw] w-[100vw] lg:ml-[40vw] ml-auto lg:px-[5%] md:px-[32px] px-auto">
        <div className="flex flex-col justify-center items-center md:w-[500px] md:ml-[50%] md:left-[-250px] w-full ml-none left-0 relative">
          <div className="flex justify-center pt-10 pb-8">
              <AptibleLogo width={160} />
            </div>
          <div className="text-center">
            <h1 className={tokens.type.h1}>Add Payment Information</h1>
            <p className="my-6 text-gray-600">
              You must enter a credit card to continue using Aptible. <br />
              Your card will be charged at the end of your monthly billing cycle.
            </p>
          </div>
            <div className="bg-white py-8 px-10 shadow rounded-lg border border-black-100">
              <form className="space-y-3" onSubmit={onSubmitForm}>
              <FormGroup label="Credit Card Number" htmlFor="credit-card-number">
                <Input
                  name="credit-card-number"
                  value={creditCardNumber}
                  onChange={(e) => setCreditCardNumber(e.target.value)}
                  required
                />
              </FormGroup>
              <div className="flex justify-between gap-4 mt-4">
                <FormGroup
                  label="Expiration Date"
                  htmlFor="credit-card-number"
                  className="w-1/2"
                >
                  <Input
                    name="credit-card-number"
                    value={expiration}
                    placeholder="MM / YY"
                    onChange={(e) => setExpiration(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup
                  label="Security Code"
                  htmlFor="credit-card-number"
                  className="w-1/2"
                >
                  <Input
                    name="credit-card-number"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    required
                  />
                </FormGroup>
              </div>

              <FormGroup label="Name on Card" htmlFor="name-on-card">
                <Input
                  id="name-on-card"
                  name="name-on-card"
                  type="text"
                  autoComplete="name-on-card"
                  required
                  className="w-full"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Street Address" htmlFor="street-address">
                <Input
                  id="street-address"
                  name="street-address"
                  type="text"
                  autoComplete="street-address"
                  required
                  className="w-full"
                  placeholder="Street and number, P.O. box, c/o."
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Apt, Suite, Etc. " htmlFor="apt-suite-etc">
                <Input
                  id="apt-suite-etc"
                  name="apt-suite-etc"
                  type="text"
                  autoComplete="apt-suite-etc"
                  placeholder="Optional"
                  required={false}
                  className="w-full"
                  value={aptSuiteEtc}
                  onChange={(e) => setAptSuiteEtc(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="City " htmlFor="city">
                <Input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="city"
                  required
                  className="w-full"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </FormGroup>
              <div className="flex justify-between gap-4 mt-4">
                <div>
                  <h4 className={"text-md font-semibold mb-2"}>State</h4>
                  <div className="flex">
                    <Select
                      className="w-full"
                      onSelect={selectState}
                      value={selectedState?.value}
                      options={stateOptions}
                    />
                  </div>
                </div>
                <FormGroup label="Zipcode" htmlFor="zipcode" className="flex-1">
                  <Input
                    name="zipcode"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    required
                  />
                </FormGroup>
              </div>
              <div className="mb-4">
                <h4 className={"text-md font-semibold mb-2"}>Country</h4>
                <div className="flex mb-2">
                  <Select
                    className="w-full"
                    onSelect={selectCountry}
                    value={selectedCountry?.value}
                    options={countryOptions}
                  />
                </div>
              </div>
              <Button type="submit" className="mt-4 font-semibold w-full">
                Save & Finish
              </Button>
            </form>
              <div className="text-center text-sm mt-4">
                <p>
                  Prefer to speak to someone first?{" "}
                  <a href="https://www.aptible.com/contact">Schedule a demo</a> or
                  go to <Link to={logoutUrl()}>Logout</Link>
                </p>
              </div>
            </div>
        </div>
      </div>
    </HeroBgLayout>
  );
};
