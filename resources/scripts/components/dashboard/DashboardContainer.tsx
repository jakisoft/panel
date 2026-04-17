import React, { useEffect, useState } from "react";
import { Server } from "@/api/server/getServer";
import getServers from "@/api/getServers";
import ServerRow from "@/components/dashboard/ServerRow";
import Spinner from "@/components/elements/Spinner";
import PageContentBlock from "@/components/elements/PageContentBlock";
import useFlash from "@/plugins/useFlash";
import { useStoreState } from "easy-peasy";
import { usePersistedState } from "@/plugins/usePersistedState";
import Switch from "@/components/elements/Switch";
import tw from "twin.macro";
import useSWR from "swr";
import { PaginatedResult } from "@/api/http";
import Pagination from "@/components/elements/Pagination";
import { useLocation } from "react-router-dom";
import styled from "styled-components/macro";
import ContentBox from "@/components/elements/ContentBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@/components/elements/dialog";
import { Button } from "@/components/elements/button/index";

export default () => {
  const { search } = useLocation();
  const [showDeniedModal, setShowDeniedModal] = useState(
    new URLSearchParams(search).get("access_denied") === "1"
  );
  const defaultPage = Number(new URLSearchParams(search).get("page") || "1");

  const [page, setPage] = useState(
    !isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1
  );
  const { clearFlashes, clearAndAddHttpError } = useFlash();
  const uuid = useStoreState((state) => state.user.data!.uuid);
  const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
  const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(
    `${uuid}:show_all_servers`,
    false
  );

  const { data: servers, error } = useSWR<PaginatedResult<Server>>(
    ["/api/client/servers", showOnlyAdmin && rootAdmin, page],
    () =>
      getServers({
        page,
        type: showOnlyAdmin && rootAdmin ? "admin" : undefined,
      })
  );

  const Container = styled.div`
    ${tw`w-full`};
  `;

  useEffect(() => {
    setPage(1);
  }, [showOnlyAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(search);

    if (params.get("access_denied") === "1") {
      setShowDeniedModal(true);
      params.delete("access_denied");

      const query = params.toString();
      window.history.replaceState(
        null,
        document.title,
        `/${query ? `?${query}` : ""}`
      );
    }
  }, [search]);

  useEffect(() => {
    if (!servers) return;
    if (servers.pagination.currentPage > 1 && !servers.items.length) {
      setPage(1);
    }
  }, [servers?.pagination.currentPage]);

  useEffect(() => {
    // Don't use react-router to handle changing this part of the URL, otherwise it
    // triggers a needless re-render. We just want to track this in the URL incase the
    // user refreshes the page.
    window.history.replaceState(
      null,
      document.title,
      `/${page <= 1 ? "" : `?page=${page}`}`
    );
  }, [page]);

  useEffect(() => {
    if (error) clearAndAddHttpError({ key: "dashboard", error });
    if (!error) clearFlashes("dashboard");
  }, [error]);

  return (
    <PageContentBlock title={"Dashboard"} showFlashKey={"dashboard"}>
      <Dialog
        open={showDeniedModal}
        title={"Access Denied"}
        description={
          "Anda tidak bisa membuka server ini kecuali owner menambahkan akun Anda pada menu Users."
        }
        onClose={() => setShowDeniedModal(false)}
      >
        <Dialog.Footer>
          <Button onClick={() => setShowDeniedModal(false)}>OK</Button>
        </Dialog.Footer>
      </Dialog>
      <ContentBox>
        <div css={tw`flex items-start text-2xl mb-2`}>
          <div>
            <FontAwesomeIcon icon={faLayerGroup} />
          </div>
          <a css={tw`text-neutral-100 font-semibold ml-2`}>Server List</a>
        </div>

        <Container>
          {rootAdmin && (
            <div css={tw`mb-2 flex justify-end items-center`}>
              <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                {showOnlyAdmin
                  ? "Showing others' servers"
                  : "Showing your servers"}
              </p>
              <Switch
                name={"show_all_servers"}
                defaultChecked={showOnlyAdmin}
                onChange={() => setShowOnlyAdmin((s) => !s)}
              />
            </div>
          )}
          {!servers ? (
            <Spinner centered size={"large"} />
          ) : (
            <Pagination data={servers} onPageSelect={setPage}>
              {({ items }) =>
                items.length > 0 ? (
                  <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4`}>
                    {items.map((server, index) => (
                      <ServerRow
                        key={server.uuid}
                        server={server}
                        css={index > 0 ? tw`mt-2` : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <p
                    css={tw`text-sm text-neutral-400 flex justify-center text-center`}
                  >
                    {showOnlyAdmin
                      ? "There are no other servers to display."
                      : "There are no servers associated with your account."}
                  </p>
                )
              }
            </Pagination>
          )}
        </Container>
      </ContentBox>
    </PageContentBlock>
  );
};
