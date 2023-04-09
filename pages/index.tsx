import { Dots } from "@/components/dots";
import useFakeLoading from "@/hooks/useFakeLoading";
import {
  Button,
  Container,
  Flex,
  Group,
  Image as MantineImage,
  Modal,
  Stack,
  Text,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCamera,
  IconCloudUpload,
  IconDownload,
  IconPaperclip,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera, Refresh } from "tabler-icons-react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: rem(120),
    paddingBottom: rem(80),

    [theme.fn.smallerThan("sm")]: {
      paddingTop: rem(80),
      paddingBottom: rem(60),
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  dots: {
    position: "absolute",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  dotsLeft: {
    left: 0,
    top: 0,
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: rem(40),
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  highlight: {
    background: "linear-gradient(to right, #228be6, #ff007f)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  description: {
    textAlign: "center",

    [theme.fn.smallerThan("xs")]: {
      textAlign: "left",
      fontSize: theme.fontSizes.md,
    },
  },

  controls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "center",

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column",
    },
  },

  control: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    [theme.fn.smallerThan("xs")]: {
      height: rem(42),
      fontSize: theme.fontSizes.md,

      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },

  wrapperD: {
    position: "relative",
    marginBottom: rem(30),
    marginTop: rem(60),
  },

  dropzone: {
    borderWidth: rem(1),
    paddingBottom: rem(50),
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  controlD: {
    position: "absolute",
    width: rem(250),
    left: `calc(50% - ${rem(180)})`,
    bottom: rem(-20),
  },
}));

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment",
};

async function sendImage(
  imageData: File,
  setAudioUrl: any,
  base64Image?: string
) {
  if (!base64Image) {
    const compressed = await compressImage(imageData);

    const reader = new FileReader();
    reader.readAsDataURL(compressed as Blob);
    reader.onload = async () => {
      const response = await fetch("/api/imagepredict", {
        method: "POST",
        body: reader.result,
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
    return "error";
  } else {
    const response = await fetch("/api/imagepredict", {
      method: "POST",
      body: base64Image,
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
  }
}

// get token from env

async function compressImage(imageData: File) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], "compressed.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.8
      ); // Set the JPEG quality to 80%
    };

    img.onerror = (error) => reject(error);

    img.src = URL.createObjectURL(imageData);
  });
}

const Home = () => {
  const [audioUrl, setAudioUrl] = useState(null);
  const { classes, theme } = useStyles();
  const openRef = useRef<() => void>(null);
  const [images, setImages] = useState<any[]>();
  const [opened, { open, close }] = useDisclosure(false);
  const [imageDetail, setImageDetail] = useState<string>("");
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [noNeedToCompress, setNoNeedToCompress] = useState<
    string | undefined
  >();

  const [loading, startLoading] = useFakeLoading();

  const webcamRef = useRef(null);
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = (webcamRef.current as any).getScreenshot();
      setNoNeedToCompress(imageSrc);
      console.log(imageSrc);
    }
  }, [webcamRef]);

  const previews = images?.map((file, index) => {
    const imageUrl = URL.createObjectURL(file || "");
    return (
      <MantineImage
        alt="image"
        key={index}
        src={imageUrl}
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  });

  return (
    <Container className={classes.wrapper} size={1400}>
      <Dots className={classes.dots} style={{ left: 0, top: 0 }} />
      <Dots className={classes.dots} style={{ left: 60, top: 0 }} />
      <Dots className={classes.dots} style={{ left: 0, top: 140 }} />
      <Dots className={classes.dots} style={{ right: 0, top: 60 }} />

      <div className={classes.inner}>
        <Title className={classes.title}>
          <Text component="span" className={classes.highlight} inherit>
            Melmy
          </Text>{" "}
          - Зураг танигч систем
        </Title>

        <Container p={0} size={600}>
          <Text size="lg" color="dimmed" className={classes.description}>
            Машин сургалт ашиглан зурагнаас обьект таньж аудио хэлбэрээр уншиж
            өгөх систем
          </Text>
        </Container>

        <div className={classes.wrapperD}>
          <Dropzone
            openRef={openRef}
            onDrop={(files) => {
              setImages(files);
              open();
            }}
            className={classes.dropzone}
            radius="md"
            accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
            // maxSize={2 * 1024}
            maxFiles={1}
          >
            {/* <div style={{ pointerEvents: "none" }}> */}
            <Group position="center">
              <Dropzone.Accept>
                <IconDownload
                  size={rem(50)}
                  color={theme.colors[theme.primaryColor][6]}
                  stroke={1.5}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  size={rem(50)}
                  color={theme.colors.red[6]}
                  stroke={1.5}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconCloudUpload
                  size={rem(50)}
                  color={
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[0]
                      : theme.black
                  }
                  stroke={1.5}
                />
              </Dropzone.Idle>
            </Group>

            <Text ta="center" fw={700} fz="lg" mt="xl">
              <Dropzone.Accept>Энд зөөнө үү</Dropzone.Accept>
              <Dropzone.Reject>Зураг биш байна</Dropzone.Reject>
              <Dropzone.Idle>Зураг оруулах</Dropzone.Idle>
            </Text>
            <Text ta="center" fz="sm" mt="xs" c="dimmed">
              Оруулах зурагаа ийшээ зөөж авчирна уу?
              <i>.jpg, .png</i> өргөтгөлтэй 2mb-с бага зургаа оруулна уу
            </Text>
            {/* </div> */}
          </Dropzone>
          <Flex className={classes.controlD} gap={16}>
            <Button
              size="md"
              radius="xl"
              onClick={() => openRef.current?.()}
              rightIcon={<IconPaperclip />}
            >
              Зураг сонгох
            </Button>
            <Button
              // className={classes.controlD}
              size="md"
              radius="xl"
              onClick={() => {
                setCameraOpen(true);
                open();
              }}
              rightIcon={<IconCamera />}
            >
              Камер нээх
            </Button>
          </Flex>
        </div>
        <Modal opened={opened} onClose={close} title="Сонгогдсон зураг">
          {cameraOpen ? (
            <Stack>
              {noNeedToCompress ? (
                <MantineImage src={noNeedToCompress} alt="Taken Image" />
              ) : (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  height="auto"
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={videoConstraints}
                />
              )}

              {noNeedToCompress ? (
                <Button
                  rightIcon={<Refresh />}
                  onClick={() => setNoNeedToCompress(undefined)}
                >
                  Дахин авах
                </Button>
              ) : (
                <Button onClick={() => capture()} rightIcon={<Camera />}>
                  Зураг авах
                </Button>
              )}
            </Stack>
          ) : (
            previews
          )}
          <Button
            onClick={() => {
              sendImage(images?.[0], setAudioUrl, noNeedToCompress);
              startLoading();
            }}
            w={"100%"}
            mt={12}
            loading={loading}
            disabled={loading}
          >
            Илгээх
          </Button>
        </Modal>
        <div className={classes.wrapper}>{imageDetail}</div>
      </div>
      {/* <Button onClick={() => {}}>FUCK YOIU</Button> */}
      <div>{audioUrl && <audio controls autoPlay src={audioUrl} />}</div>
    </Container>
  );
};

export default Home;
