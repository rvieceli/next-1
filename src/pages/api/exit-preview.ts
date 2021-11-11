import url from 'url';
import { NextApiRequest, NextApiResponse } from 'next';

export default (request: NextApiRequest, response: NextApiResponse): void => {
  // Exit the current user from "Preview Mode". This function accepts no args.
  response.clearPreviewData();

  const queryObject = url.parse(request.url, true).query;
  const redirectUrl =
    queryObject && queryObject.currentUrl ? queryObject.currentUrl : '/';

  response.writeHead(307, { Location: redirectUrl });
  response.end();
};
