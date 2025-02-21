"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/provider";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reportFormSchema = z.object({
  reason: z.enum(["spam", "inappropriate", "copyright", "other"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportButtonProps {
  seriesId: string;
}

export function ReportButton({ seriesId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reason: "spam",
      description: "",
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to report a series",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("reports").insert({
        series_id: seriesId,
        reporter_id: user.id,
        reason: values.reason,
        description: values.description,
      });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for your report. We will review it shortly.",
      });
      setOpen(false);
      form.reset();
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Series</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {["spam", "inappropriate", "copyright", "other"].map(
                        (type) => (
                          <FormItem
                            key={type}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={type} />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">
                              {type.replace("_", " ")}
                            </FormLabel>
                          </FormItem>
                        )
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide more details about your report..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Submit Report
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
