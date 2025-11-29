import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/database/client";
import { twiml } from "twilio";

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || "";
  const params = new URLSearchParams(url.split("?")[1]);
  const leadPhone = params.get("lead");
  const agentId = params.get("agentId");
console.log("Bridge received leadPhone:", leadPhone);

  if (!leadPhone || !agentId) return "<Response></Response>";

  const agent = await prisma.insuranceAgent.findUnique({
    where: { id: Number(agentId) },
  });

  if (!agent || !agent.phone) return "<Response></Response>";

const response = new twiml.VoiceResponse();
response.say("Connecting you and the lead now.");

response.dial({ callerId: process.env.TWILIO_PHONE_NUMBER })
  .number(leadPhone);

event.node.res.setHeader("Content-Type", "text/xml");
return response.toString();


});
