import React, { useState } from "react";
import EditSubuserModal from "@/components/server/users/EditSubuserModal";
import { Button } from "@/components/elements/button/index";
import tw from "twin.macro";

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <EditSubuserModal
        visible={visible}
        onModalDismissed={() => setVisible(false)}
      />
      <Button onClick={() => setVisible(true)} css={tw`w-full sm:w-auto`}>
        New User
      </Button>
    </>
  );
};
