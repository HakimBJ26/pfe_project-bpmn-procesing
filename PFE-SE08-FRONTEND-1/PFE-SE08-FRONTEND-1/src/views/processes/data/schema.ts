import { z } from "zod"


export const processSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string().nullable(),
  version: z.number(),
  resourceName: z.string(),
  deploymentId: z.string(),
  description: z.string().nullable(),
  diagramResourceName: z.string().nullable(),
  bpmnXml: z.string().nullable(),
  diagramBytes: z.string().nullable(),
  suspended: z.boolean(),
})

export type Process = z.infer<typeof processSchema>
