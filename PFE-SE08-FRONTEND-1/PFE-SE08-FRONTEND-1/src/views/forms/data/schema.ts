import { z } from "zod"

export const formSchema = z.object({
  id: z.string(),
  formKey: z.string(),
  title: z.string(),
  creationTimestamp: z.string(),
  updateTimestamp: z.string(),
})

export type Form = z.infer<typeof formSchema> 