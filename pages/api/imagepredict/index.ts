import axios from "axios";
import { translate } from "bing-translate-api";
import { NextApiRequest, NextApiResponse } from "next";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN ?? "",
});

export default async function hander(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let output: any;
  output = await replicate.run(
    "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
    {
      input: {
        image: req.body,
      },
    }
  );
  let caption;
  if (typeof output === "string" && output) {
    caption = output.split(":")[1];
  } else {
    console.error("Error: output is not a string", output);
    res.end();
    return;
  }

  const translation = await translate(caption, "en", "mn-Cyrl");

  const url = "https://api.chimege.com/v1.2/synthesize";
  const headers = {
    "Content-Type": "plain/text",
    Token: process.env.CHIMEGE_TOKEN,
  };
  const text = "Зурагны тайлбар бол : " + translation.translation;

  const response = await axios.post(url, text, {
    headers,
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data);

  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Content-Length", buffer.length);
  res.setHeader("Content-Disposition", 'attachment; filename="hello.wav"');
  res.write(buffer);
  res.end();
}
