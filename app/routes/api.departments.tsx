import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import Departments from "~/modal/department";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const departments = await Departments.find().sort({ name: 1 });
    return json({
      success: true,
      data: departments,
      message: "Departments retrieved successfully",
    });
  } catch (error: any) {
    return json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};
