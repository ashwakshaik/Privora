export const CONFIG = {
  MOCK_OTP_CODE: "123456",
  MOCK_RECOVERY_CODE: "000000",
  SCAN_PROGRESS_STEPS: [
    "Initializing search matrices...",
    "Querying Whitepages.com directories...",
    "Matching records on Spokeo databases...",
    "Scanning Radaris.com email registries...",
    "Scanning Intelius.com address logs...",
    "BeenVerified.com check...",
    "Filtering relative matching structures...",
    "Compiling exposure profiles..."
  ],
} as const;
