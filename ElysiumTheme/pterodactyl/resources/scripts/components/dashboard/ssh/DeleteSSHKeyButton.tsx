import tw from "twin.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { useFlashKey } from "@/plugins/useFlash";
import { deleteSSHKey, useSSHKeys } from "@/api/account/ssh-keys";
import { Dialog } from "@/components/elements/dialog";
import Code from "@/components/elements/Code";
import { Button } from "@/components/elements/button/index";

export default ({
  name,
  fingerprint,
}: {
  name: string;
  fingerprint: string;
}) => {
  const { clearAndAddHttpError } = useFlashKey("account");
  const [visible, setVisible] = useState(false);
  const { mutate } = useSSHKeys();

  const onClick = () => {
    clearAndAddHttpError();

    Promise.all([
      mutate(
        (data) => data?.filter((value) => value.fingerprint !== fingerprint),
        false
      ),
      deleteSSHKey(fingerprint),
    ]).catch((error) => {
      mutate(undefined, true).catch(console.error);
      clearAndAddHttpError(error);
    });
  };

  return (
    <>
      <Dialog.Confirm
        open={visible}
        title={"Delete SSH Key"}
        confirm={"Delete Key"}
        onConfirmed={onClick}
        onClose={() => setVisible(false)}
      >
        Removing the <Code>{name}</Code> SSH key will invalidate its usage
        across the Panel.
      </Dialog.Confirm>
      <Button.Danger
        css={tw`w-8 h-8 ml-4 transition-transform duration-100`}
        type={"button"}
        onClick={() => setVisible(true)}
      >
        <FontAwesomeIcon icon={faTrashAlt} />
      </Button.Danger>
    </>
  );
};
