export const onGet: any = async ({ json }: any) => {
  throw json(200, {
    endpoints: [
      '/api/gradient',
    ],
  });
};