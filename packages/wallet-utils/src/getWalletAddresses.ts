import { AddressPurpose, GetAddressResponse } from "sats-connect";

const getAddressByPurpose = (
  response: GetAddressResponse,
  purpose: AddressPurpose
) => response.addresses.find((item) => item.purpose === purpose)?.address;

export function getWalletAddresses(response: GetAddressResponse) {
  let ordinalAddress = getAddressByPurpose(response, AddressPurpose.Ordinals);
  let paymentAddress = getAddressByPurpose(response, AddressPurpose.Payment);
  return {
    ordinalAddress,
    paymentAddress,
  };
}
