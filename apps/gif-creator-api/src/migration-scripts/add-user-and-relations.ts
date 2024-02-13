import { Order } from "@repo/gif-creator-db";
import prisma from "../lib/prisma-client";

(async function () {
  const ordinals = await prisma.ordinal.findMany({
    include: {
      html_files_order: true,
      image_files_order: true,
    },
  });

  for (const ordinal of ordinals) {
    const { id } = ordinal;
    const { html_files_order, image_files_order } = ordinal;
    const order: Order = (html_files_order || image_files_order)!;
    await prisma.ordinal.update({
      where: {
        id,
      },
      data: {
        receiver_address: order.receiver_address,
      },
    });
  }
})();
