const { APIClient, SendEmailRequest } = require("customerio-node");

const customerio_client = new APIClient(process.env.CUSTOMERIO_API_KEY as string);

export async function POST(req: Request) {

    const request = new SendEmailRequest({
      transactional_message_id: "2",
      identifiers: {
        id: "123",
      },
      to: "nishant.aklecha@gmail.com",
      from: "omar@knowmore.bot"
    });

    customerio_client.sendEmail(request)
    .then((res: any) => console.log(res))
    .catch((err: any) => console.log(err.statusCode, err.message))

}
