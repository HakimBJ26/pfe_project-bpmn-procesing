import { z } from "zod"


export const workflowSchema = z.object({
  id: z.string(),
  title: z.string(),
  workflowContent: z.string(),
  creationTimestamp: z.string(),
  updateTimestamp: z.string(),
  readyToDeploy: z.boolean().optional().default(true),
})

export type Workflow = z.infer<typeof workflowSchema>
